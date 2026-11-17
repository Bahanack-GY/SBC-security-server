"use strict";
/**
 * Creates a Secure Canal admin. Server only (POST /users/admin/create was
 * public and let anyone make themselves admin).
 *
 *   node scripts/create-admin.js "Name" email@example.com
 *
 * The password is read from the ADMIN_PASSWORD environment variable so it
 * never lands in the shell history: ADMIN_PASSWORD='…' node scripts/create-admin.js …
 */
process.env.WHATSAPP_DISABLED = "1";
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const config = require("../config");
const Admin = require("../models/admin").default;

(async () => {
    const [name, email] = process.argv.slice(2);
    const password = process.env.ADMIN_PASSWORD || "";
    if (!name || !email || password.length < 12) {
        console.error('Usage: ADMIN_PASSWORD=\'<12+ chars>\' node scripts/create-admin.js "Name" email');
        process.exit(1);
    }
    await mongoose.connect(config.mongodbUri);
    if (await Admin.exists({ email })) {
        console.error(`An admin with ${email} already exists.`);
    } else {
        await Admin.create({ name, email, password: await bcrypt.hash(password, 10) });
        console.log(`Admin ${email} created.`);
    }
    await mongoose.disconnect();
})().catch((err) => { console.error(err); process.exit(1); });
