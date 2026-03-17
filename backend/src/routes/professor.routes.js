import express from "express";
import { registerProfessor, loginProfessor, logoutProfessor, publishProject, getApplicationsForProject, acceptApplication, assignTask, markProjectComplete } from "../contorller/professor.controller.js";
import { verifyProfessorJWT } from "../middelware/professor.auth.js";

const professorRouter = express.Router();

professorRouter.route("/register").post(registerProfessor);
professorRouter.route("/login").post(loginProfessor);

// secured routes
professorRouter.route("/logout").post(verifyProfessorJWT, logoutProfessor);
professorRouter.route("/publish-project").post(verifyProfessorJWT, publishProject);
professorRouter.route("/applications/:projectId").get(verifyProfessorJWT, getApplicationsForProject);
professorRouter.route("/accept-application/:applicationId").patch(verifyProfessorJWT, acceptApplication);
professorRouter.route("/assign-task/:projectId").post(verifyProfessorJWT, assignTask);
professorRouter.route("/complete-project/:projectId").patch(verifyProfessorJWT, markProjectComplete);

export default professorRouter;