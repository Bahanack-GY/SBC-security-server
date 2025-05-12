"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const whatsapp_client_1 = __importDefault(require("../services/whatsapp.client"));
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.send("Hello World");
});
router.post('/sendMessage', async (req, res) => {
    try {
        await whatsapp_client_1.default.sendMessage(req.body.phoneNumber, req.body.message);
        console.log(`Message sent to ${req.body.phoneNumber}: ${req.body.message}`);
        res.send("Message sent");
    }
    catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});
exports.default = router;
