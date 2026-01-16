use crate::error::Error;
use curv::elliptic::curves::{Scalar, Point, Ed25519};
use multi_party_eddsa::protocols::musig2;
use solana_sdk::pubkey::Pubkey;
use multi_party_eddsa::protocols::ExpandedKeyPair;
use solana_sdk::signature::Keypair;
use solana_sdk::signature::Signer;
use crate::serialization::{AggMessage1, SecretAggStepOne, PartialSignature};
use multi_party_eddsa::protocols::musig2::{PrivatePartialNonces, PublicPartialNonces};
use solana_sdk::signature::{Signature, SignerError};
use solana_sdk::transaction::Transaction;
use crate::serialization::Error as SerError;

pub fn key_agg(
    keys: Vec<Pubkey>,
    key: Option<Pubkey>,
) -> Result<musig2::PublicKeyAgg, Error> {
    if keys.is_empty() {
        return Err(Error::NotEnoughKeys);
    }

    let convert = |k: Pubkey| {
        Point::<Ed25519>::from_bytes(&k.to_bytes())
            .map_err(|e| Error::InvalidPoint(format!("{:?}", e)))
    };

    let keys: Vec<_> = keys.into_iter()
        .map(convert)
        .collect::<Result<_, _>>()?;

    let key = key
        .map(convert)
        .unwrap_or_else(|| Ok(keys[0].clone()))?;

    musig2::PublicKeyAgg::key_aggregation_n(keys, &key)
        .ok_or(Error::KeyPairIsNotInKeys)
}

pub fn step_one(keypair: &Keypair) -> (AggMessage1, SecretAggStepOne) {
    let expanded = ExpandedKeyPair::create_from_private_key(keypair.secret().to_bytes());
    let (private_nonces, public_nonces) =
        musig2::generate_partial_nonces(&expanded, None);

    (
        AggMessage1 {
            sender: keypair.pubkey(),
            public_nonces: public_nonces.clone(),
        },
        SecretAggStepOne {
            private_nonces,
            public_nonces,
        },
    )
}

struct PartialSigner {
    signer_private_nonce: PrivatePartialNonces,
    signer_public_nonce: PublicPartialNonces,
    other_nonces: Vec<[Point<Ed25519>; 2]>,
    extended_kepair: ExpandedKeyPair,
    aggregated_pubkey: musig2::PublicKeyAgg,
}

impl Signer for PartialSigner {
    fn try_pubkey(&self) -> Result<Pubkey, SignerError> {
        Ok(Pubkey::new(&*self.aggregated_pubkey.agg_public_key.to_bytes(true)))
    }

    fn try_sign_message(&self, message: &[u8]) -> Result<Signature, SignerError> {
        let sig = musig2::partial_sign(
            &self.other_nonces,
            self.signer_private_nonce.clone(),
            self.signer_public_nonce.clone(),
            &self.aggregated_pubkey,
            &self.extended_kepair,
            message,
        );
        let mut sig_bytes = [0u8; 64];
        sig_bytes[..32].copy_from_slice(&*sig.R.to_bytes(true));
        sig_bytes[32..].copy_from_slice(&sig.my_partial_s.to_bytes());
        Ok(Signature::new(&sig_bytes))
    }

    fn is_interactive(&self) -> bool {
        false
    }
}

pub fn step_two(
    keypair: &Keypair,
    mut tx: Transaction,
    keys: Vec<Pubkey>,
    first_messages: Vec<AggMessage1>,
    secret_state: SecretAggStepOne,
) -> Result<PartialSignature, Error> {
    
    let other_nonces: Vec<_> = first_messages
        .into_iter()
        .map(|msg1| msg1.public_nonces.R)
        .collect();

    
    let aggkey = key_agg(keys, Some(keypair.pubkey()))?;
    let extended_kepair =
        ExpandedKeyPair::create_from_private_key(keypair.secret().to_bytes());

    
    let recent_blockhash = tx.message.recent_blockhash;

    let signer = PartialSigner {
        signer_private_nonce: secret_state.private_nonces,
        signer_public_nonce: secret_state.public_nonces,
        other_nonces,
        extended_kepair,
        aggregated_pubkey: aggkey,
    };

    
    tx.sign(&[&signer], recent_blockhash);

    let sig = tx.signatures[0];
    Ok(PartialSignature(sig))
}

pub fn aggregate_and_attach_signature(
    mut tx: Transaction,
    keys: Vec<Pubkey>,
    signatures: Vec<PartialSignature>,
) -> Result<Transaction, Error> {

    if signatures.is_empty() {
        return Err(Error::MismatchMessages);
    }

    
    let aggkey = key_agg(keys, None)?;

    
    let agg_encoded = aggkey.agg_public_key.to_bytes(true);
    let agg_vec = agg_encoded.to_vec();
    let agg32: [u8; 32] = agg_vec
        .try_into()
        .map_err(|_| Error::InvalidPoint("aggregated pubkey not 32 bytes".to_string()))?;
    let aggpubkey = Pubkey::from(agg32);

    
    let r0 = &signatures[0].0.as_ref()[..32];
    if !signatures
        .iter()
        .all(|s| &s.0.as_ref()[..32] == r0)
    {
        return Err(Error::MismatchMessages);
    }

    
    let deserialize_R = |s: &[u8]| {
        Point::from_bytes(s).map_err(|e| Error::DeserializationFailed {
            error: SerError::InvalidPoint(e),
            field_name: "signatures",
        })
    };

    let deserialize_s = |s: &[u8]| {
        Scalar::from_bytes(s).map_err(|e| Error::DeserializationFailed {
            error: SerError::InvalidScalar(e),
            field_name: "signatures",
        })
    };

    
    let first = musig2::PartialSignature {
        R: deserialize_R(&signatures[0].0.as_ref()[..32])?,
        my_partial_s: deserialize_s(&signatures[0].0.as_ref()[32..])?,
    };

    let s_parts: Vec<_> = signatures[1..]
        .iter()
        .map(|p| deserialize_s(&p.0.as_ref()[32..]))
        .collect::<Result<_, _>>()?;

    
    let full_sig = musig2::aggregate_partial_signatures(&first, &s_parts);

    
    let mut bytes = [0u8; 64];
    bytes[..32].copy_from_slice(&*full_sig.R.to_bytes(true));
    bytes[32..].copy_from_slice(&full_sig.s.to_bytes());

    
    let required = tx.message.header.num_required_signatures as usize;
    let signer_keys = &tx.message.account_keys[..required];

    let sig_index = signer_keys
        .iter()
        .position(|k| *k == aggpubkey)
        .ok_or(Error::KeyPairIsNotInKeys)?;

    
    if tx.signatures.len() != required {
        tx.signatures = vec![Signature::default(); required];
    }

    
    tx.signatures[sig_index] = Signature::new(&bytes);

    
    tx.verify().map_err(|_| Error::InvalidSignature)?;

    println!(
        "[aggregate] full signed tx (hex) = {}",
        hex::encode(bincode::serialize(&tx).unwrap())
    );

    Ok(tx)
}
