import { google } from "googleapis";
import * as fs from "fs";
import * as path from "path";

const CREDENTIALS_DIR = "/Users/gatiktrivedi/.openclaw/credentials";
const TOKEN_PATH = path.join(CREDENTIALS_DIR, "google_token.json");
const CLIENT_PATH = path.join(CREDENTIALS_DIR, "google_oauth_client.json");

export async function getAuth() {
  const clientJson = JSON.parse(fs.readFileSync(CLIENT_PATH, "utf8"));
  const { client_id, client_secret } = clientJson.installed || clientJson.web || {};

  const oauth2 = new google.auth.OAuth2(client_id, client_secret, "http://localhost:8099/");

  const tokenData = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
  oauth2.setCredentials({
    access_token: tokenData.token,
    refresh_token: tokenData.refresh_token,
    token_type: tokenData.token_type || "Bearer",
    expiry_date: tokenData.expiry ? new Date(tokenData.expiry).getTime() : undefined,
  });

  // Auto-refresh
  oauth2.on("tokens", (tokens) => {
    const updated = { ...tokenData, ...tokens };
    if (tokens.access_token) updated.token = tokens.access_token;
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(updated, null, 2));
  });

  return oauth2;
}
