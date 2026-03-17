import express from "express";
import { registerAdmin, loginAdmin, logoutAdmin } from "../contorller/admin.controller.js";
import { verifyAdminJWT } from "../middelware/admin.auth.js";

const adminRouter = express.Router();

adminRouter.route("/register").post(registerAdmin);
adminRouter.route("/login").post(loginAdmin);

// secured routes
adminRouter.route("/logout").post(verifyAdminJWT, logoutAdmin);

export default adminRouter;