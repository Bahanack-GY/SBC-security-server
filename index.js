"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const whatsapp_routes_1 = __importDefault(require("./routes/whatsapp.routes"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const allowedOrigins = [
    "http://localhost:5174",
    "https://localhost:5174",
    "http://localhost:3002",
    "http://localhost:3008",
    "http://10.230.139.174:5174/",
    "https://sbc-security-ui.onrender.com",
    "https://sbc-security-ui.onrender.com/",
    "https://www.canal-de-vente.sniperbuisnesscenter.com",
    "https://www.canal-de-vente.sniperbuisnesscenter.com/"
];
// Middleware
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Check if the origin is in the allowed list or is undefined (for non-browser requests)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true); // Allow the request
        }
        else {
            callback(new Error("Not allowed by CORS")); // Block the request
        }
    },
    credentials: true, // Allow cookies and credentials
}));
app.use(express_1.default.json({ limit: "10mb" })); // Adjust the limit as needed
app.use(body_parser_1.default.json({ limit: "10mb" }));
app.use(body_parser_1.default.urlencoded({ limit: "10mb", extended: true }));
//Middleware for parsing form data
app.use(express_1.default.json()); // For parsing JSON request bodies
app.use((0, cookie_parser_1.default)()); // For parsing cookies
app.use(express_1.default.json());
app.use("/users", users_routes_1.default);
app.use("/whatsapp", whatsapp_routes_1.default);
mongoose_1.default
    .connect("mongodb+srv://root:Cassandra12@cluster0.6uhtjk8.mongodb.net/SBC?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => {
    console.log('Connected to MongoDB');
    app.listen(3002, '0.0.0.0', () => {
        console.log(`Server is running on port 3002`);
    });
})
    .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
});
