"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controllers_1 = require("../controllers/users.controllers");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Admins are created on the server only (scripts/create-admin.js), never over HTTP.
router.post('/admin/login', (0, auth_1.rateLimit)({ windowMs: 15 * 60 * 1000, max: 10 }), users_controllers_1.loginAdmin);
// Admin UI (Secure Canal): a valid admin token.
router.post('/create-link', auth_1.requireAdmin, users_controllers_1.createLink);
router.put('/edit-link/:id', auth_1.requireAdmin, users_controllers_1.editLink);
router.delete('/delete-link/:id', auth_1.requireAdmin, users_controllers_1.deleteLink);
router.get('/get-links', auth_1.requireAdmin, users_controllers_1.getLinks);
// Public: the canal de vente page checks that a code has a link.
router.get('/get-link/:code/:phone', (0, auth_1.rateLimit)({ windowMs: 60 * 1000, max: 60 }), users_controllers_1.getLink);
exports.default = router;
