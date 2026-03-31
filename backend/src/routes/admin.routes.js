import express from "express";
import { registerAdmin, loginAdmin, logoutAdmin, getAllProjects, getAllInternships, getAllProfessors, getAllStudents, getAdminProfile, getAdminDashboardStats, getRecentActivities, getProfessorDetails, getStudentDetails, createStudentByAdmin, createProfessorByAdmin } from "../controllers/admin.controller.js";
import { verifyAdminJWT } from "../middleware/admin.auth.js";

const adminRouter = express.Router();

adminRouter.route("/register").post(registerAdmin);
adminRouter.route("/login").post(loginAdmin);

// secured routes
adminRouter.route("/me").get(verifyAdminJWT, getAdminProfile);
adminRouter.route("/logout").post(verifyAdminJWT, logoutAdmin);
adminRouter.route("/all-projects").get(verifyAdminJWT, getAllProjects);
adminRouter.route("/internships").get(verifyAdminJWT, getAllInternships);
adminRouter.route("/professors").get(verifyAdminJWT, getAllProfessors);
adminRouter.route("/students").get(verifyAdminJWT, getAllStudents);
adminRouter.route("/stats").get(verifyAdminJWT, getAdminDashboardStats);
adminRouter.route("/activities").get(verifyAdminJWT, getRecentActivities);
adminRouter.route("/professor-details/:professorId").get(verifyAdminJWT, getProfessorDetails);
adminRouter.route("/student-details/:studentId").get(verifyAdminJWT, getStudentDetails);
adminRouter.route("/create-student").post(verifyAdminJWT, createStudentByAdmin);
adminRouter.route("/create-professor").post(verifyAdminJWT, createProfessorByAdmin);

export default adminRouter;