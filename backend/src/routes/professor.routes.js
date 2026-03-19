import express from "express";
import { registerProfessor, loginProfessor, logoutProfessor, publishProject, getApplicationsForProject, acceptApplication, assignTask, markProjectComplete, getProfessorProfile, getMyProjects } from "../controllers/professor.controller.js";
import { verifyProfessorJWT } from "../middleware/professor.auth.js";

const professorRouter = express.Router();

professorRouter.route("/register").post(registerProfessor);
professorRouter.route("/login").post(loginProfessor);

// secured routes
professorRouter.route("/me").get(verifyProfessorJWT, getProfessorProfile);
professorRouter.route("/my-projects").get(verifyProfessorJWT, getMyProjects);
professorRouter.route("/logout").post(verifyProfessorJWT, logoutProfessor);
professorRouter.route("/publish-project").post(verifyProfessorJWT, publishProject);
professorRouter.route("/applications/:projectId").get(verifyProfessorJWT, getApplicationsForProject);
professorRouter.route("/accept-application/:applicationId").patch(verifyProfessorJWT, acceptApplication);
professorRouter.route("/assign-task/:projectId").post(verifyProfessorJWT, assignTask);
professorRouter.route("/complete-project/:projectId").patch(verifyProfessorJWT, markProjectComplete);
professorRouter.route("/review-task/:taskId").patch(verifyProfessorJWT, reviewTaskSubmission);

export default professorRouter;