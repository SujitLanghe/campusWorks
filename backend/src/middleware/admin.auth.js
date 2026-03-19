import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";

export const verifyAdminJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.adminAccessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ message: "Unauthorized request" });
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const admin = await Admin.findById(decodedToken?._id).select("-password -refreshToken");

        if (!admin) {
            return res.status(401).json({ message: "Invalid Access Token" });
        }

        req.admin = admin;
        next();
    } catch (error) {
        return res.status(401).json({ message: error?.message || "Invalid access token" });
    }
};
