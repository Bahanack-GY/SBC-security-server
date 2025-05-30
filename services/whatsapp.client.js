"use strict";
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const { Client, LocalAuth } = require("whatsapp-web.js");
const { setTimeout: sleep } = require('timers/promises');
const fs = require('fs');

// Helper: Random delay between min and max ms
function randomDelay(min = 800, max = 2500) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: Randomize message content
function randomizeMessage(base, name, link) {
  const now = new Date();
  const hour = now.getHours();
  let greeting = '';
  if (hour >= 5 && hour < 12) {
    greeting = 'Bonjour';
  } else if (hour >= 12 && hour < 18) {
    greeting = 'Bon après-midi';
  } else if (hour >= 18 && hour < 22) {
    greeting = 'Bonsoir';
  } else {
    greeting = 'Bonsoir'; // Default to Bonsoir for late night
  }
  const signatures = [
    'Merci pour votre confiance.',
    'À bientôt!',
    'Ensemble contre tous!',
    'Bonne journée!',
    'Cordialement, SBC.'
  ];
  const signature = signatures[Math.floor(Math.random() * signatures.length)];
  let message = `${greeting}, chere membre de la famille SBC, ${name.toUpperCase()}, voici le lien personnalisé de votre canal de vente: ${link} ${signature}`;
  if (hour >= 22 || hour < 5) {
    message += ' Bonne nuit!';
  }
  return message;
}

const TARGET_NUMBER = "237673377111"; // Your target phone number

const whatsappClient = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: puppeteer,
  puppeteerOptions: {
    headless: true, // Shows browser for debugging
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      // Realistic user agent
      "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    ],
  },
  takeoverOnConflict: true, // Forcefully takes over an existing session
  restartOnAuthFail: true,  // Auto-restart if auth fails
});

// Set profile picture and status on ready
whatsappClient.on("ready", async () => {
  const currentUser = await whatsappClient.info;
  const loggedInNumber = currentUser.wid.user;
  if (loggedInNumber === TARGET_NUMBER) {
    console.log(`✅ Connected to +${TARGET_NUMBER}`);
  } else {
    console.log(`❌ Wrong number! Connected to +${loggedInNumber}`);
  }
  // Set profile picture (must be a local file, e.g., './profile.jpg')
  try {
    const image = fs.readFileSync('./profile.jpg');
    await whatsappClient.setProfilePicture(currentUser.wid._serialized, image);
    await whatsappClient.setStatus('Disponible pour la famille SBC!');
  } catch (e) {
    console.log('Could not set profile picture or status:', e.message);
  }
});

// 🔹 Show pairing code when available
whatsappClient.on("auth_code", (code) => {
  console.log(`🔢 **Pairing Code: ${code}**`);
  console.log("📱 Go to WhatsApp → Linked Devices → Link a Device");
});

// 🔹 Debug events
whatsappClient.on("loading_screen", (percent) => {
  console.log(`⚙️ Loading: ${percent}%`);
});

whatsappClient.on("qr", (qr) => {
  console.log("❗ Fallback to QR code (phone linking failed)");
  require("qrcode-terminal").generate(qr, { small: true });
});

whatsappClient.on("auth_failure", (msg) => {
  console.error("🚨 Auth failed:", msg);
});

// 🚀 Start
whatsappClient.initialize()
  .then(() => console.log("🔗 Initializing..."))
  .catch(console.error);

// --- STEALTH: Typing simulation and randomized sendMessage wrapper ---
whatsappClient.sendHumanMessage = async function (to, message, name = '', link = '') {
  const delay = randomDelay();
  await this.sendPresenceAvailable();
  await this.sendTyping(to);
  await sleep(delay);
  // Randomize message if name and link provided
  const msg = (name && link) ? randomizeMessage(message, name, link) : message;
  return this.sendMessage(to, msg);
};

module.exports = whatsappClient;
