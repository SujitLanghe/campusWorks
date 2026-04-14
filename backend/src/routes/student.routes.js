import express from "express";
import { registerStudent, loginStudent, logoutStudent, getStudentProjects, updateProfile, applyToProject, getAppliedProjects, submitTask, downloadCertificate, getStudentProfile, getAssignedTasks, getProjectDetails, getAnnouncements } from "../controllers/student.controller.js";
import { upload } from "../middleware/multer.js";
import { verifyStudentJWT } from "../middleware/student.auth.js";

const studentRouter = express.Router();

studentRouter.route("/register").post(registerStudent);

studentRouter.route("/login").post(loginStudent);

// secured routes
studentRouter.route("/me").get(verifyStudentJWT, getStudentProfile);
studentRouter.route("/logout").post(verifyStudentJWT, logoutStudent);
studentRouter.route("/projects").get(verifyStudentJWT, getStudentProjects);
studentRouter.route("/update-profile").patch(
    verifyStudentJWT,
    upload.fields([
        { name: "resume", maxCount: 1 }
    ]),
    updateProfile
);
studentRouter.route("/apply/:projectId").post(verifyStudentJWT, applyToProject);
studentRouter.route("/applied-projects").get(verifyStudentJWT, getAppliedProjects);
studentRouter.route("/tasks").get(verifyStudentJWT, getAssignedTasks);
studentRouter.route("/submit-task/:taskId").post(
    verifyStudentJWT,
    upload.fields([
        { name: "video", maxCount: 1 },
        { name: "images", maxCount: 5 }
    ]),
    submitTask
);
studentRouter.route("/project/:projectId").get(verifyStudentJWT, getProjectDetails);
studentRouter.route("/announcements").get(verifyStudentJWT, getAnnouncements);
studentRouter.route("/certificate/:projectId").get(verifyStudentJWT, downloadCertificate);

export default studentRouter;