CREATE TABLE users2 (
  id UUID PRIMARY KEY,
  external_user_id TEXT NOT NULL UNIQUE,
  pubkey TEXT NOT NULL,             
  secret_key BYTEA NOT NULL
);
