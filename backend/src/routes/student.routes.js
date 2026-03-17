import express from "express";
import { registerStudent, loginStudent, logoutStudent } from "../contorller/student.controller.js";
import { upload } from "../middelware/multer.js";
import { verifyStudentJWT } from "../middelware/student.auth.js";

const studentRouter = express.Router();

studentRouter.route("/register").post(
    upload.fields([
        { name: "resume", maxCount: 1 }
    ]),
    registerStudent
);

studentRouter.route("/login").post(loginStudent);

// secured routes
studentRouter.route("/logout").post(verifyStudentJWT, logoutStudent);

export default studentRouter;