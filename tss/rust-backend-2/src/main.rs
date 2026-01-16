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
    external_user_id: u8,
    tx: String,                  
    keys: Vec<String>,           
    first_messages: Vec<String>,
}

#[derive(Serialize)]
struct StepTwoResponse {
    external_user_id: u8,
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

#[derive(Serialize)]
struct BlockhashResponse {
    blockhash: String,
    last_valid_block_height: u64,
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
        INSERT INTO users1 (id, external_user_id, pubkey, secret_key)
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
        .with_state(state);

    println!("TSS Rust backend 2 running at http://{addr}");

    let listner = TcpListener::bind(addr).await.unwrap();

    axum::serve(listner, app).await.unwrap();
}