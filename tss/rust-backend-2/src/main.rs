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

#[tokio::main]
async fn main() {

    dotenvy::dotenv().ok();

    let bind_addr = std::env::var("BIND_ADDR").unwrap_or_else(|_| "127.0.0.1:3001".to_string());
    
    let addr: std::net::SocketAddr = bind_addr.parse().expect("BIND_ADDR must be like 127.0.0.1:3001");

    let app = Router::new();

    println!("TSS Rust backend 2 running at http://{addr}");

    let listner = TcpListener::bind(addr).await.unwrap();

    axum::serve(listner, app).await.unwrap();
}