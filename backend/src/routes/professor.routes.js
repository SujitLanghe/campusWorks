import express from "express";
import { registerProfessor, loginProfessor, logoutProfessor } from "../contorller/professor.controller.js";
import { verifyProfessorJWT } from "../middelware/professor.auth.js";

const professorRouter = express.Router();

professorRouter.route("/register").post(registerProfessor);
professorRouter.route("/login").post(loginProfessor);

// secured routes
professorRouter.route("/logout").post(verifyProfessorJWT, logoutProfessor);

export default professorRouter;