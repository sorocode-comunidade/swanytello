#!/usr/bin/env node
/**
 * Prints a JWT for local/Postman use when AUTH_STATUS=on.
 * Run from project root: node -r dotenv/config scripts/dev-token.mjs
 * Copy the token into Postman collection variable "token".
 */
import crypto from "node:crypto";

const secret = process.env.JWT_SECRET || "your-secret-key";
const expiresIn = process.env.JWT_ACCESS_EXPIRATION || "15m";

const now = Math.floor(Date.now() / 1000);
const exp = expiresIn === "15m" ? now + 15 * 60 : now + 24 * 60 * 60; // 15m or 1d

const payload = {
  user: {
    id: "dev-user-id",
    username: "dev",
    email: "dev@local",
    role: "ADMIN",
  },
  iat: now,
  exp,
};

function base64url(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
const payloadEnc = base64url(JSON.stringify(payload));
const signingInput = `${header}.${payloadEnc}`;
const sig = crypto.createHmac("sha256", secret).update(signingInput).digest("base64url");
const token = `${signingInput}.${sig}`;

console.log("\nUse this token in Postman (collection variable 'token') or Authorization: Bearer <token>\n");
console.log(token);
console.log("");
