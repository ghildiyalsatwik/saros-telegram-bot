mod error;
mod serialization;
mod tss;
use base64::Engine;

use axum::{
    extract::State,
    routing::post,
    Json, Router,
};
use rand07::thread_rng;
use serde::{Deserialize, Serialize};
use solana_sdk::{
    pubkey::Pubkey,
    signature::{Keypair, Signer},
    transaction::Transaction,
};
use std::{
    collections::HashMap,
    net::SocketAddr,
    str::FromStr,
    sync::{Arc, Mutex},
};
use tokio::net::TcpListener;
use crate::serialization::Serialize as B58Serialize;
use crate::serialization::{
    AggMessage1,
    SecretAggStepOne,
    PartialSignature
};
use solana_client::rpc_client::RpcClient;
use sqlx::PgPool;
use sqlx::Row;

#[derive(Clone)]
struct AppState {
    db: PgPool,
}

#[derive(Deserialize)]
struct GenerateRequest {
    external_user_id: String,
}

#[derive(Serialize)]
struct GenerateResponse {
    external_user_id: String,
    public_key: String,
}

#[derive(Deserialize)]
struct AggregateRequest {
    keys: Vec<String>,
}

#[derive(Serialize)]
struct AggregateResponse {
    aggregated_pubkey: String,
}

#[derive(Deserialize)]
struct StepOneRequest {
    external_user_id: String,
}

#[derive(Serialize)]
struct StepOneResponse {
    external_user_id: String,
    public_message: String,
}

#[derive(Deserialize)]
struct StepTwoRequest {
    external_user_id: String,
    tx: String,                  
    keys: Vec<String>,           
    first_messages: Vec<String>,
}

#[derive(Serialize)]
struct StepTwoResponse {
    external_user_id: String,
    partial_signature: String,   
}

#[derive(Deserialize)]
struct FinalSignRequest {
    tx: String,
    signatures: Vec<String>, 
    keys: Vec<String>,
}

#[derive(Serialize)]
struct FinalSignResponse {
    tx_signature: String,
}

async fn generate(
    State(state): State<AppState>,
    Json(req): Json<GenerateRequest>,
) -> Json<GenerateResponse> {

    let keypair = Keypair::new();

    let public_key = keypair.pubkey().to_string();
    let secret_bytes = keypair.to_bytes().to_vec();

    let id = uuid::Uuid::new_v4().to_string();

    sqlx::query(
        r#"
        INSERT INTO users2 (id, external_user_id, pubkey, secret_key)
        VALUES ($1, $2, $3, $4)
        "#,
    )
    .bind(&id)
    .bind(&req.external_user_id)
    .bind(&public_key)
    .bind(&secret_bytes)
    .execute(&state.db)
    .await
    .expect("failed to insert user");

    println!(
        "Created user {} with pubkey {}",
        req.external_user_id, public_key
    );

    Json(GenerateResponse {
        external_user_id: req.external_user_id,
        public_key,
    })
}

async fn aggregate_keys(
    Json(req): Json<AggregateRequest>,
) -> Json<AggregateResponse> {
    let pubkeys: Vec<Pubkey> = req
        .keys
        .iter()
        .map(|k| Pubkey::from_str(k).expect("invalid pubkey string"))
        .collect();

    let agg = tss::key_agg(pubkeys, None).expect("key aggregation failed");

    let agg_vec = agg.agg_public_key.to_bytes(true).to_vec();
    let agg_bytes: [u8; 32] = agg_vec.try_into().expect("expected 32 bytes");

    let agg_pubkey = Pubkey::from(agg_bytes);

    Json(AggregateResponse {
        aggregated_pubkey: agg_pubkey.to_string(),
    })
}

async fn step_one(
    State(state): State<AppState>,
    Json(req): Json<StepOneRequest>,
) -> Json<StepOneResponse> {

    let row = sqlx::query(
        r#"
        SELECT secret_key
        FROM users2
        WHERE external_user_id = $1
        "#
    )
    .bind(&req.external_user_id)
    .fetch_one(&state.db)
    .await
    .expect("user not found / db error");

    let secret_bytes: Vec<u8> = row.get("secret_key");

    
    let keypair = Keypair::from_bytes(&secret_bytes)
        .expect("invalid secret key bytes in DB (expected 64 bytes)");

    let (msg1, secret) = tss::step_one(&keypair);

    let public_message_b58 = msg1.serialize_bs58();
    let secret_state_b58 = secret.serialize_bs58();

    sqlx::query(
        r#"
        INSERT INTO signer_state2 (external_user_id, secret_state)
        VALUES ($1, $2)
        "#
    )
    .bind(&req.external_user_id)
    .bind(&secret_state_b58)
    .execute(&state.db)
    .await
    .expect("failed to upsert signing session");

    Json(StepOneResponse {
        external_user_id: req.external_user_id,
        public_message: public_message_b58,
    })
}

async fn step_two(
    State(state): State<AppState>,
    Json(req): Json<StepTwoRequest>,
) -> Json<StepTwoResponse> {
    
    let row_user = sqlx::query(
        r#"
        SELECT secret_key
        FROM users2
        WHERE external_user_id = $1
        "#
    )
    .bind(&req.external_user_id)
    .fetch_one(&state.db)
    .await
    .expect("user not found / db error");

    let secret_bytes: Vec<u8> = row_user.get("secret_key");

    let keypair = Keypair::from_bytes(&secret_bytes)
        .expect("invalid secret key bytes in DB (expected 64 bytes)");


    let row_state = sqlx::query(
        r#"
        SELECT secret_state
        FROM signer_state2
        WHERE external_user_id = $1
        "#
    )
    .bind(&req.external_user_id)
    .fetch_one(&state.db)
    .await
    .expect("no signer_state found for user (step_one missing?)");

    let secret_state_b58: String = row_state.get("secret_state");

    let secret_state =
        SecretAggStepOne::deserialize_bs58(secret_state_b58.as_bytes())
            .expect("bad SecretAggStepOne stored in DB");

    
    let tx_bytes = base64::engine::general_purpose::STANDARD
        .decode(&req.tx)
        .expect("invalid base64 tx");

    let tx: Transaction = bincode::deserialize(&tx_bytes)
        .expect("failed to deserialize transaction");

    
    let keys: Vec<Pubkey> = req
        .keys
        .iter()
        .map(|k| Pubkey::from_str(k).expect("invalid pubkey"))
        .collect();

    
    let first_messages: Vec<AggMessage1> = req
        .first_messages
        .iter()
        .map(|s| AggMessage1::deserialize_bs58(s.as_bytes()).expect("bad AggMessage1"))
        .collect();

    
    let partial = tss::step_two(&keypair, tx, keys, first_messages, secret_state)
        .expect("step_two failed");

    let partial_signature = partial.serialize_bs58();

    sqlx::query(
        r#"
        DELETE FROM signer_state2
        WHERE external_user_id = $1
        "#
    )
    .bind(&req.external_user_id)
    .execute(&state.db)
    .await
    .expect("failed to delete signer state");

    Json(StepTwoResponse {
        external_user_id: req.external_user_id,
        partial_signature,
    })
}

#[tokio::main]
async fn main() {

    dotenvy::dotenv().ok();

    let bind_addr = std::env::var("BIND_ADDR").unwrap_or_else(|_| "127.0.0.1:3001".to_string());
    
    let addr: std::net::SocketAddr = bind_addr.parse().expect("BIND_ADDR must be like 127.0.0.1:3001");

    let db_url = std::env::var("DATABASE_URL").expect("DATABASE_URL not set");

    let db = PgPool::connect(&db_url).await.expect("db connect failed");

    let state = AppState { db };

    let app = Router::new()
        .route("/generate", post(generate))
        .route("/aggregate_keys", post(aggregate_keys))
        .route("/step_one", post(step_one))
        .route("/step_two", post(step_two))
        .with_state(state);

    println!("TSS Rust backend 2 running at http://{addr}");

    let listner = TcpListener::bind(addr).await.unwrap();

    axum::serve(listner, app).await.unwrap();
}