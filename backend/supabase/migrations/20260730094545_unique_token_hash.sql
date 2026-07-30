ALTER TABLE refresh_tokens
ADD UNIQUE (token_hash);
