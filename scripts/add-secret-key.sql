-- Add secret_key column to api_keys table for displaying full API key
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS secret_key VARCHAR(100);
CREATE INDEX IF NOT EXISTS idx_api_keys_secret ON api_keys(secret_key);
