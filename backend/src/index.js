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

connectDB().then(() => {
    startTaskExpiryCron();
});

app.use(cors({
    origin: [
        "http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"
    ],
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get("/", (req,res)=>{
    res.send("API Running")
})


app.use("/api/v1/student", studentRouter);
app.use("/api/v1/professor", professorRouter);
app.use("/api/v1/admin", adminRouter);


const PORT = process.env.PORT || 8001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});