"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLink = exports.getLinks = exports.deleteLink = exports.editLink = exports.createLink = exports.loginAdmin = exports.createAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const admin_1 = __importDefault(require("../models/admin"));
const users_1 = __importDefault(require("../models/users"));
const whatsapp_client_1 = __importDefault(require("../services/whatsapp.client"));
const createAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // Check if admin already exists
        const existingAdmin = await admin_1.default.findOne({ email });
        if (existingAdmin) {
            res.status(400).json({ message: 'Admin with this email already exists' });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const admin = await admin_1.default.create({ name, email, password: hashedPassword });
        // Remove password from response
        const adminResponse = admin.toObject();
        delete adminResponse.password;
        res.status(201).json(adminResponse);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating admin', error: error.message });
    }
};
exports.createAdmin = createAdmin;
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
        const token = jsonwebtoken_1.default.sign({ id: admin._id, email: admin.email }, "sbc1324", { expiresIn: '1d' });
        // Remove password from response
        const adminResponse = admin.toObject();
        delete adminResponse.password;
        res.status(200).json({ admin: adminResponse, token });
    }
    catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};
exports.loginAdmin = loginAdmin;
const createLink = async (req, res) => {
    try {
        const { name, phone, code } = req.body;
        const existingUser = await users_1.default.findOne({ code });
        if (existingUser) {
            res.status(400).json({ message: 'Un lien avec ce code existe deja' });
            return;
        }
        const link = `https://www.canal-de-vente.sniperbuisnesscenter.com/${code}/${phone}`;
        const user = await users_1.default.create({ name, phone, code, link });
        const waPhone = String(phone).replace(/\D/g, ''); // Remove non-digits
        const waId = waPhone.endsWith('@c.us') ? waPhone : `${waPhone}@c.us`;
        const customMessage = 'Bonjour, chere membre de la famille SBC, ' + name.toUpperCase() + ', voici le lien personnalisé de votre canal de vente: ';
        const endMessage = 'Merci pour votre confiance. Ensemble contre tous!';
        const fullMessage = `${customMessage}${link} ${endMessage}`;
        await whatsapp_client_1.default.sendMessage(waId, fullMessage);
        res.status(201).json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating link', error: error.message });
    }
};
exports.createLink = createLink;
const editLink = async (req, res) => {
    try {
        const { name, phone, code } = req.body;
        const { id } = req.params;
        const link = `https://www.canal-de-vente.sniperbuisnesscenter.com/${code}/${phone}`;
        const user = await users_1.default.findByIdAndUpdate(id, { name, phone, code, link });
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Error editing link', error: error.message });
    }
};
exports.editLink = editLink;
const deleteLink = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await users_1.default.findByIdAndDelete(id);
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting link', error: error.message });
    }
};
exports.deleteLink = deleteLink;
const getLinks = async (req, res) => {
    try {
        const users = await users_1.default.find();
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({ message: 'Error getting links', error: error.message });
    }
};
exports.getLinks = getLinks;
const getLink = async (req, res) => {
    try {
        const { code, phone } = req.params;
        const user = await users_1.default.findOne({ code: { $regex: new RegExp(`^${code}$`, 'i') } });
        if (!user) {
            res.status(404).json({ message: 'Lien non trouvé' });
            return;
        }
        console.log(user);
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Error getting link', error: error.message });
    }
};
exports.getLink = getLink;
