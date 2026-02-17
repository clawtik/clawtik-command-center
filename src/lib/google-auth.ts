import { google } from "googleapis";

// For Vercel deployment, credentials come from env vars
// Locally, falls back to files
const getCredentials = () => {
  // Try env vars first (Vercel)
  if (process.env.GOOGLE_TOKEN_JSON && process.env.GOOGLE_CLIENT_JSON) {
    return {
      token: JSON.parse(process.env.GOOGLE_TOKEN_JSON),
      client: JSON.parse(process.env.GOOGLE_CLIENT_JSON),
    };
  }

  // Fall back to files (local dev)
  const fs = require("fs");
  const path = require("path");
  const CREDENTIALS_DIR = "/Users/gatiktrivedi/.openclaw/credentials";
  return {
    token: JSON.parse(fs.readFileSync(path.join(CREDENTIALS_DIR, "google_token.json"), "utf8")),
    client: JSON.parse(fs.readFileSync(path.join(CREDENTIALS_DIR, "google_oauth_client.json"), "utf8")),
  };
};

export async function getAuth() {
  const { token: tokenData, client: clientJson } = getCredentials();
  const { client_id, client_secret } = clientJson.installed || clientJson.web || {};

  const oauth2 = new google.auth.OAuth2(client_id, client_secret, "http://localhost:8099/");

  oauth2.setCredentials({
    access_token: tokenData.token,
    refresh_token: tokenData.refresh_token,
    token_type: tokenData.token_type || "Bearer",
    expiry_date: tokenData.expiry ? new Date(tokenData.expiry).getTime() : undefined,
  });

  return oauth2;
}
