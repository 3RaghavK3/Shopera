ALTER TABLE refresh_tokens
ALTER COLUMN expires_at TYPE TIMESTAMPTZ;

ALTER TABLE refresh_tokens
ALTER COLUMN expires_at SET DEFAULT (NOW() + INTERVAL '7 days');

ALTER TABLE refresh_tokens
ALTER COLUMN created_at TYPE TIMESTAMPTZ;

ALTER TABLE refresh_tokens
ALTER COLUMN created_at SET DEFAULT NOW();