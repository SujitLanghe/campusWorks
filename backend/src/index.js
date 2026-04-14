import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./utils/connectdb.js";
import studentRouter from "./routes/student.routes.js";
import professorRouter from "./routes/professor.routes.js"; 
import adminRouter from "./routes/admin.routes.js";
import { startTaskExpiryCron } from "./utils/cronJobs.js";

dotenv.config();

const app = express();

// 1. Global Middleware (Synchronous Registration)
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003"
];

app.use(cors({
    origin: function (origin, callback) {
        // For development and easy deployment, allow any origin.
        // The true flag reflects the exact origin of the requester.
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. API Routes
app.get("/", (req, res) => {
    res.send("campusWorks API Strategic Oversight: ACTIVE");
});

app.use("/api/v1/student", studentRouter);
app.use("/api/v1/professor", professorRouter);
app.use("/api/v1/admin", adminRouter);

// 3. Database Link and Server Activation
connectDB()
    .then(() => {
        startTaskExpiryCron();
        const PORT = process.env.PORT || 8001;
        app.listen(PORT, () => {
            console.log(`[STRATEGIC LINK] MongoDB connection successful.`);
            console.log(`[HUB] Server initialized and listening on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("[CRITICAL FAILURE] Strategic Link Error:", err);
        process.exit(1);
    });

// 4. Nodemon Trigger 