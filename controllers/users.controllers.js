"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureLink = exports.getLink = exports.getLinks = exports.deleteLink = exports.editLink = exports.createLink = exports.loginAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const admin_1 = __importDefault(require("../models/admin"));
const users_1 = __importDefault(require("../models/users"));
const whatsapp_client_1 = __importDefault(require("../services/whatsapp.client"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../config");
// Admins are created on the server only: scripts/create-admin.js.
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await admin_1.default.findOne({ email });
        if (!admin) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, admin.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        // Create JWT token
        const token = jsonwebtoken_1.default.sign({ id: admin._id, email: admin.email }, config_1.jwtSecret, { expiresIn: '1d' });
        // Remove password from response
        const adminResponse = admin.toObject();
        delete adminResponse.password;
        res.status(200).json({ admin: adminResponse, token });
    }
    catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
};
exports.loginAdmin = loginAdmin;
// --- Links ---------------------------------------------------------------
// The link is always built here, from the code and phone, on the one public
// domain. The code is the member's SBC referral code.
const CODE_RE = /^[A-Za-z0-9_-]{3,40}$/;
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** Exact, case-insensitive match on the code (never a regex built from input). */
const byCode = (code) => ({ code: { $regex: new RegExp(`^${escapeRegex(code)}$`, "i") } });
const cleanPhone = (phone) => String(phone ?? "").replace(/\D/g, "");
const buildLink = (code, phone) => `${config_1.linkBaseUrl}/${encodeURIComponent(code)}/${phone}`;
const validate = (body) => {
    const code = String(body?.code ?? "").trim();
    const phone = cleanPhone(body?.phone);
    const name = String(body?.name ?? "").trim().slice(0, 120);
    if (!CODE_RE.test(code)) return { error: "Code invalide" };
    if (phone.length < 8 || phone.length > 15) return { error: "Numéro de téléphone invalide" };
    if (!name) return { error: "Nom obligatoire" };
    return { code, phone, name };
};
const sendLinkMessage = async (name, phone, link) => {
    const waId = `${phone}@c.us`;
    const fullMessage = `Bonjour, chere membre de la famille SBC, ${name.toUpperCase()}, voici le lien personnalisé de votre canal de vente: ${link} Merci pour votre confiance. Ensemble contre tous!`;
    await whatsapp_client_1.default.sendMessage(waId, fullMessage);
};

/** Admin UI: create a link by hand. */
const createLink = async (req, res) => {
    try {
        const v = validate(req.body);
        if (v.error) {
            res.status(400).json({ message: v.error });
            return;
        }
        if (await users_1.default.exists(byCode(v.code))) {
            res.status(400).json({ message: 'Un lien avec ce code existe deja' });
            return;
        }
        const link = buildLink(v.code, v.phone);
        const user = await users_1.default.create({ name: v.name, phone: v.phone, code: v.code, link });
        try {
            await sendLinkMessage(v.name, v.phone, link);
        } catch (err) {
            console.error(`WhatsApp message for ${v.code} not sent: ${err?.message}`);
        }
        res.status(201).json(user);
    }
    catch (error) {
        console.error('Error creating link:', error);
        res.status(500).json({ message: 'Error creating link' });
    }
};
exports.createLink = createLink;

/** Admin UI: change a link. */
const editLink = async (req, res) => {
    try {
        const v = validate(req.body);
        if (v.error) {
            res.status(400).json({ message: v.error });
            return;
        }
        const { id } = req.params;
        if (!mongoose_1.default.isValidObjectId(id)) {
            res.status(404).json({ message: 'Lien non trouvé' });
            return;
        }
        const clash = await users_1.default.findOne(byCode(v.code)).select('_id').lean();
        if (clash && String(clash._id) !== id) {
            res.status(400).json({ message: 'Un lien avec ce code existe deja' });
            return;
        }
        const link = buildLink(v.code, v.phone);
        const user = await users_1.default.findByIdAndUpdate(id, { name: v.name, phone: v.phone, code: v.code, link }, { new: true });
        if (!user) {
            res.status(404).json({ message: 'Lien non trouvé' });
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error('Error editing link:', error);
        res.status(500).json({ message: 'Error editing link' });
    }
};
exports.editLink = editLink;

/** Admin UI: delete a link. */
const deleteLink = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.isValidObjectId(id)) {
            res.status(404).json({ message: 'Lien non trouvé' });
            return;
        }
        const user = await users_1.default.findByIdAndDelete(id);
        res.status(200).json(user);
    }
    catch (error) {
        console.error('Error deleting link:', error);
        res.status(500).json({ message: 'Error deleting link' });
    }
};
exports.deleteLink = deleteLink;

/** Admin UI: every link. */
const getLinks = async (req, res) => {
    try {
        const users = await users_1.default.find().sort({ createdAt: -1 });
        res.status(200).json(users);
    }
    catch (error) {
        console.error('Error getting links:', error);
        res.status(500).json({ message: 'Error getting links' });
    }
};
exports.getLinks = getLinks;

/**
 * Public (the canal de vente page): does this code have a link? Answers only
 * what the page needs, never the whole record.
 */
const getLink = async (req, res) => {
    try {
        const code = String(req.params.code ?? '');
        if (!CODE_RE.test(code)) {
            res.status(404).json({ message: 'Lien non trouvé' });
            return;
        }
        const user = await users_1.default.findOne(byCode(code)).select('code').lean();
        if (!user) {
            res.status(404).json({ message: 'Lien non trouvé' });
            return;
        }
        res.status(200).json({ code: user.code, valid: true });
    }
    catch (error) {
        console.error('Error getting link:', error);
        res.status(500).json({ message: 'Error getting link' });
    }
};
exports.getLink = getLink;

/**
 * SBC only (X-Service-Secret): makes sure a Pack Winner member has a link.
 * An existing link for the code is returned as it is (phone and name kept,
 * no message sent). Otherwise the link is created, and the WhatsApp message is
 * sent only when SBC asks (`notify: true`).
 */
const ensureLink = async (req, res) => {
    try {
        const v = validate(req.body);
        if (v.error) {
            res.status(400).json({ message: v.error });
            return;
        }
        const existing = await users_1.default.findOne(byCode(v.code)).lean();
        if (existing) {
            res.status(200).json({ link: buildLink(existing.code, cleanPhone(existing.phone)), created: false });
            return;
        }
        const link = buildLink(v.code, v.phone);
        try {
            await users_1.default.create({ name: v.name, phone: v.phone, code: v.code, link });
        } catch (err) {
            // Two calls for the same member at once: the other one created it.
            const again = await users_1.default.findOne(byCode(v.code)).lean();
            if (!again) throw err;
            res.status(200).json({ link: buildLink(again.code, cleanPhone(again.phone)), created: false });
            return;
        }
        let notified = false;
        if (req.body?.notify === true) {
            try {
                await sendLinkMessage(v.name, v.phone, link);
                notified = true;
            } catch (err) {
                console.error(`WhatsApp message for ${v.code} not sent: ${err?.message}`);
            }
        }
        res.status(201).json({ link, created: true, notified });
    }
    catch (error) {
        console.error('Error ensuring link:', error);
        res.status(500).json({ message: 'Error ensuring link' });
    }
};
exports.ensureLink = ensureLink;
