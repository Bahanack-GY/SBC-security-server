"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const whatsapp_web_js_1 = require("whatsapp-web.js");
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
const whatsappClient = new whatsapp_web_js_1.Client({
    authStrategy: new whatsapp_web_js_1.LocalAuth()
});
whatsappClient.on('qr', (qr) => qrcode_terminal_1.default.generate(qr, { small: true }));
whatsappClient.on('ready', () => console.log('WhatsApp client is ready'));
whatsappClient.on('message', async (msg) => {
    try {
        if (msg.from !== 'status@broadcast') {
            const contact = await msg.getContact();
            console.log(`Message from ${contact.name}: ${msg.body}`);
            await msg.reply('hi');
        }
    }
    catch (err) {
        console.log(err);
    }
});
whatsappClient.initialize();
exports.default = whatsappClient;
