"use strict";
/**
 * Every secret comes from .env (never from the code: this repo was public with
 * the database password and the JWT secret in it). The server refuses to start
 * without them.
 */
require("dotenv").config();

const required = ["MONGODB_URI", "JWT_SECRET", "CANAL_SERVICE_SECRET"];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
    console.error(`Missing in .env: ${missing.join(", ")}. Refusing to start.`);
    process.exit(1);
}
if (process.env.JWT_SECRET.length < 32 || process.env.CANAL_SERVICE_SECRET.length < 32) {
    console.error("JWT_SECRET and CANAL_SERVICE_SECRET must be at least 32 characters. Refusing to start.");
    process.exit(1);
}

module.exports = {
    mongodbUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    serviceSecret: process.env.CANAL_SERVICE_SECRET,
    port: parseInt(process.env.PORT || "3050", 10),
    // nginx proxies from the same machine; nothing else should reach the port.
    host: process.env.HOST || "127.0.0.1",
    linkBaseUrl: (process.env.LINK_BASE_URL || "https://canaldevente.sniperbuisnesscenter.com").replace(/\/$/, ""),
};
