import mongoose from "mongoose";
import { uploadResult } from "../utils/Cloudinary.js";
import Student from "../models/student.model.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (studentID) => {
    try {
        const student = await Student.findById(studentID);
        const accessToken = student.generateAccessToken();
        const refreshToken = student.generateRefreshToken();

        student.refreshToken = refreshToken;

        await student.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        return null;
    }
};

const registerStudent = async (req, res) => {
    try {
        const { firstname, lastname, email, enrollmentno, password, department, year, phone } = req.body;

        if ([firstname, lastname, email, enrollmentno, password, department, year, phone].some(field => !field || !field.trim())) {
            return res.status(400).json({ message: "ALL FIELDS ARE REQUIRED" });
        }

        const existedStudent = await Student.findOne({
            $or: [{ enrollmentno }, { email }]
        });

        if (existedStudent) {
            return res.status(400).json({ message: "student already exists" });
        }

        const resumeLocalPath = req.files?.resume?.[0]?.path;

        if (!resumeLocalPath) {
            return res.status(400).json({ message: "resume is missing" });
        }

        const resume = await uploadResult(resumeLocalPath);

        if (!resume) {
            return res.status(500).json({ message: "something went wrong while uploading resume" });
        }

        const student = await Student.create({
            name: {
                firstname: firstname.toLowerCase(),
                lastname: lastname.toLowerCase()
            },
            password,
            email,
            enrollmentno,
            department,
            year,
            phone,
            resumeUrl: resume.url
        });

        const createdStudent = await Student.findById(student._id).select("-password -refreshToken");

        if (!createdStudent) {
            return res.status(500).json({ message: "student can't be registered" });
        }

        return res.status(201).json({
            success: true,
            message: "Student registered successfully",
            student: createdStudent
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const loginStudent = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const student = await Student.findOne({ email });

        if (!student) {
            return res.status(404).json({ message: "student does not exist" });
        }

        const isValid = await student.isPasswordCorrect(password);

        if (!isValid) {
            return res.status(401).json({ message: "password is not valid" });
        }

        const tokens = await generateAccessAndRefreshTokens(student._id);
        if(!tokens) {
            return res.status(500).json({ message: "Failed to generate tokens" });
        }

        const { accessToken, refreshToken } = tokens;

        const loggedStudent = await Student.findById(student._id).select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
                success: true,
                message: "student logged in successfully",
                student: loggedStudent,
                accessToken,
                refreshToken
            });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const logoutStudent = async (req, res) => {
    try {
        await Student.findByIdAndUpdate(
            req.student._id,
            {
                $set: {
                    refreshToken: undefined
                }
            },
            {
                new: true
            }
        );

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        };

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({
                success: true,
                message: "student logged out"
            });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export {
    registerStudent,
    loginStudent,
    logoutStudent
};
