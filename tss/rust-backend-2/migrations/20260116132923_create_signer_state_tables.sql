CREATE TABLE signer_state1 (
  external_user_id TEXT PRIMARY KEY REFERENCES users1(external_user_id) ON DELETE CASCADE,
  secret_state BYTEA NOT NULL
);

CREATE TABLE signer_state2 (
  external_user_id TEXT PRIMARY KEY REFERENCES users2(external_user_id) ON DELETE CASCADE,
  secret_state BYTEA NOT NULL
);

