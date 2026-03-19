import jwt from "jsonwebtoken";
import Professor from "../models/professor.model.js";

export const verifyProfessorJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.professorAccessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ message: "Unauthorized request" });
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const professor = await Professor.findById(decodedToken?._id).select("-password -refreshToken");

        if (!professor) {
            return res.status(401).json({ message: "Invalid Access Token" });
        }

        req.professor = professor;
        next();
    } catch (error) {
        return res.status(401).json({ message: error?.message || "Invalid access token" });
    }
};
