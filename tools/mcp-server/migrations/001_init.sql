CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ravelry app registry (admin-managed, not user-facing)
CREATE TABLE IF NOT EXISTS mcp_ravelry_app (
    slug TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    ravelry_consumer_key TEXT NOT NULL,
    ravelry_consumer_secret TEXT NOT NULL,
    auth_type TEXT NOT NULL DEFAULT 'oauth1',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- OAuth 2.0 dynamic client registrations
CREATE TABLE IF NOT EXISTS mcp_oauth_client (
    client_id TEXT PRIMARY KEY,
    client_secret TEXT,
    client_id_issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    client_secret_expires_at TIMESTAMPTZ,
    redirect_uris TEXT[] NOT NULL DEFAULT '{}',
    client_name TEXT,
    client_uri TEXT,
    grant_types TEXT[] NOT NULL DEFAULT '{authorization_code}',
    response_types TEXT[] NOT NULL DEFAULT '{code}',
    token_endpoint_auth_method TEXT NOT NULL DEFAULT 'client_secret_post',
    scope TEXT
);

-- Temporary authorization codes
CREATE TABLE IF NOT EXISTS mcp_auth_code (
    code TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES mcp_oauth_client(client_id),
    app_slug TEXT REFERENCES mcp_ravelry_app(slug),
    redirect_uri TEXT NOT NULL,
    code_challenge TEXT NOT NULL,
    scopes TEXT[] NOT NULL DEFAULT '{}',
    ravelry_access_token TEXT NOT NULL,
    ravelry_token_secret TEXT NOT NULL,
    ravelry_username TEXT,
    ravelry_user_id INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
    used BOOLEAN NOT NULL DEFAULT FALSE
);

-- MCP sessions
CREATE TABLE IF NOT EXISTS mcp_session (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    access_token TEXT NOT NULL UNIQUE,
    refresh_token TEXT UNIQUE,
    app_slug TEXT REFERENCES mcp_ravelry_app(slug),
    ravelry_access_token TEXT NOT NULL,
    ravelry_token_secret TEXT NOT NULL,
    ravelry_username TEXT,
    ravelry_user_id INTEGER,
    client_id TEXT NOT NULL,
    scopes TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    revoked BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_mcp_session_access ON mcp_session(access_token) WHERE NOT revoked;
CREATE INDEX IF NOT EXISTS idx_mcp_session_refresh ON mcp_session(refresh_token) WHERE NOT revoked;
CREATE INDEX IF NOT EXISTS idx_mcp_auth_code_exp ON mcp_auth_code(expires_at) WHERE NOT used;
