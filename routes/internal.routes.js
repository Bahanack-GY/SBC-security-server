"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controllers_1 = require("../controllers/users.controllers");
const auth_1 = require("../middleware/auth");
/** SBC (user-service) only, with X-Service-Secret. nginx also refuses /internal from outside. */
const router = (0, express_1.Router)();
router.post('/links/ensure', auth_1.requireService, users_controllers_1.ensureLink);
exports.default = router;
