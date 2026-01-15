use std::fmt::{Display, Formatter};
use bs58::decode::Error as Bs58Error;
use solana_client::client_error::ClientError;

use crate::serialization::Error as DeserializationError;

#[derive(Debug)]
pub enum Error {
    WrongNetwork(String),
    BadBase58(Bs58Error),
    WrongKeyPair(ed25519_dalek::SignatureError),
    AirdropFailed(ClientError),
    RecentHashFailed(ClientError),
    ConfirmingTransactionFailed(ClientError),
    BalaceFailed(ClientError),
    SendTransactionFailed(ClientError),
    DeserializationFailed { error: DeserializationError, field_name: &'static str },
    MismatchMessages,
    InvalidSignature,
    KeyPairIsNotInKeys,
    InvalidScalar(String),
    InvalidPoint(String),
}

impl Display for Error {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Error::WrongNetwork(n) => write!(f, "Unknown network: {}", n),
            Error::BadBase58(e) => write!(f, "Base58 decode failed: {}", e),
            Error::WrongKeyPair(e) => write!(f, "Keypair error: {}", e),
            Error::AirdropFailed(e) => write!(f, "Airdrop failed: {}", e),
            Error::RecentHashFailed(e) => write!(f, "Recent blockhash failed: {}", e),
            Error::ConfirmingTransactionFailed(e) => write!(f, "Confirmation failed: {}", e),
            Error::BalaceFailed(e) => write!(f, "Balance check failed: {}", e),
            Error::SendTransactionFailed(e) => write!(f, "Send transaction failed: {}", e),
            Error::DeserializationFailed { error, field_name } =>
                write!(f, "Failed to deserialize {}: {}", field_name, error),
            Error::MismatchMessages => write!(f, "Partial signatures R-values do not match"),
            Error::InvalidSignature => write!(f, "Final aggregated signature verification failed"),
            Error::KeyPairIsNotInKeys => write!(f, "Keypair is not included in key aggregation"),
            Error::InvalidPoint(e) => write!(f, "Invalid Ed25519 point: {}", e),
            Error::InvalidScalar(e) => write!(f, "Invalid scalar: {}", e),
        }
    }
}

impl std::error::Error for Error {}

impl From<Bs58Error> for Error {
    fn from(e: Bs58Error) -> Self {
        Error::BadBase58(e)
    }
}

impl From<ed25519_dalek::SignatureError> for Error {
    fn from(e: ed25519_dalek::SignatureError) -> Self {
        Error::WrongKeyPair(e)
    }
}