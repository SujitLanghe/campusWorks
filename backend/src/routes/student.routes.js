import express from "express";
import { registerStudent, loginStudent, logoutStudent, getProjects, updateProfile, applyToProject, getAppliedProjects, submitTask, downloadCertificate } from "../contorller/student.controller.js";
import { upload } from "../middelware/multer.js";
import { verifyStudentJWT } from "../middelware/student.auth.js";

const studentRouter = express.Router();

studentRouter.route("/register").post(registerStudent);

studentRouter.route("/login").post(loginStudent);

// secured routes
studentRouter.route("/logout").post(verifyStudentJWT, logoutStudent);
studentRouter.route("/projects").get(verifyStudentJWT, getProjects);
studentRouter.route("/update-profile").patch(
    verifyStudentJWT,
    upload.fields([
        { name: "resume", maxCount: 1 }
    ]),
    updateProfile
);
studentRouter.route("/apply/:projectId").post(verifyStudentJWT, applyToProject);
studentRouter.route("/applied-projects").get(verifyStudentJWT, getAppliedProjects);
studentRouter.route("/submit-task/:taskId").post(
    verifyStudentJWT,
    upload.fields([
        { name: "video", maxCount: 1 },
        { name: "images", maxCount: 5 }
    ]),
    submitTask
);
studentRouter.route("/certificate/:projectId").get(verifyStudentJWT, downloadCertificate);

export default studentRouter;