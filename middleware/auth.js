"use strict";
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const config = require("../config");
const Admin = require("../models/admin").default;

/** Admin UI calls: a valid admin JWT whose admin still exists. */
const requireAdmin = async (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) return res.status(401).json({ message: "Authentification requise" });
    try {
        const claims = jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"] });
        const admin = await Admin.findById(claims.id).select("_id email").lean();
        if (!admin) return res.status(401).json({ message: "Authentification requise" });
        req.admin = admin;
        return next();
    } catch {
        return res.status(401).json({ message: "Authentification requise" });
    }
};

const sameSecret = (given, expected) => {
    const a = crypto.createHash("sha256").update(String(given)).digest();
    const b = crypto.createHash("sha256").update(String(expected)).digest();
    return crypto.timingSafeEqual(a, b);
};

/** SBC (user-service) calls: the shared secret in X-Service-Secret. */
const requireService = (req, res, next) => {
    const given = req.headers["x-service-secret"];
    if (typeof given !== "string" || !sameSecret(given, config.serviceSecret)) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    return next();
};

/** Small in-memory limiter (per IP), enough for the login form. */
const rateLimit = ({ windowMs, max }) => {
    const hits = new Map();
    return (req, res, next) => {
        const now = Date.now();
        const key = req.headers["x-real-ip"] || req.ip;
        const entry = hits.get(key);
        if (!entry || entry.resetAt <= now) {
            hits.set(key, { count: 1, resetAt: now + windowMs });
        } else if (++entry.count > max) {
            return res.status(429).json({ message: "Trop de tentatives, réessayez plus tard" });
        }
        if (hits.size > 10000) for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
        return next();
    };
};

module.exports = { requireAdmin, requireService, rateLimit };
