import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./utils/connectdb.js";
import studentRouter from "./routes/student.routes.js";
import professorRouter from "./routes/professor.routes.js";
import adminRouter from "./routes/admin.routes.js";
dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get("/", (req,res)=>{
    res.send("API Running")
})


app.use("/api/student", studentRouter);
app.use("/api/professor", professorRouter);
app.use("/api/admin", adminRouter);


const PORT = process.env.PORT || 8001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});