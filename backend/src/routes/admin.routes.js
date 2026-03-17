import express from "express";
import { registerAdmin, loginAdmin, logoutAdmin, getAllProjects, getAllInternships, getAllProfessors, getAllStudents } from "../contorller/admin.controller.js";
import { verifyAdminJWT } from "../middelware/admin.auth.js";

const adminRouter = express.Router();

adminRouter.route("/register").post(registerAdmin);
adminRouter.route("/login").post(loginAdmin);

// secured routes
adminRouter.route("/logout").post(verifyAdminJWT, logoutAdmin);
adminRouter.route("/all-projects").get(verifyAdminJWT, getAllProjects);
adminRouter.route("/internships").get(verifyAdminJWT, getAllInternships);
adminRouter.route("/professors").get(verifyAdminJWT, getAllProfessors);
adminRouter.route("/students").get(verifyAdminJWT, getAllStudents);

export default adminRouter;