import mongoose from "mongoose";
import { uploadResult } from "../utils/Cloudinary.js";
import Student from "../models/student.model.js";
import Project from "../models/project.model.js";
import Application from "../models/application.model.js";
import Task from "../models/task.model.js";
import Announcement from "../models/announcement.model.js";
import { generateCertificate } from "../utils/generateCertificate.js";
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

export const registerStudent = async (req, res) => {
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

export const loginStudent = async (req, res) => {
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

        const isProd = process.env.NODE_ENV === "production";
        const options = {
            httpOnly: true,
            secure: isProd, 
            sameSite: isProd ? "None" : "Lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        };

        return res
            .status(200)
            .cookie("studentAccessToken", accessToken, options)
            .cookie("studentRefreshToken", refreshToken, options)
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

export const logoutStudent = async (req, res) => {
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

        const isProd = process.env.NODE_ENV === "production";
        const options = {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "None" : "Lax",
            path: "/"
        };

        return res
            .status(200)
            .clearCookie("studentAccessToken", options)
            .clearCookie("studentRefreshToken", options)
            .json({
                success: true,
                message: "student logged out"
            });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { skills, github, linkedin } = req.body;
        const updateData = {};

        if (skills) {
            updateData.skills = Array.isArray(skills) ? skills : skills.split(",").map(skill => skill.trim());
        }

        if (github) updateData.github = github;
        if (linkedin) updateData.linkedin = linkedin;

        const resumeLocalPath = req.files?.resume?.[0]?.path;

        if (resumeLocalPath) {
            const resume = await uploadResult(resumeLocalPath);
            if (!resume) {
                return res.status(500).json({ message: "something went wrong while uploading resume" });
            }
            updateData.resumeUrl = resume.url;
        }

        const student = await Student.findByIdAndUpdate(
            req.student._id,
            {
                $set: updateData
            },
            {
                new: true
            }
        ).select("-password -refreshToken");

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            student
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const applyToProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ message: "Message is required to apply" });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (project.status !== "OPEN") {
            return res.status(400).json({ message: "Project is no longer open for applications" });
        }

        const existingApplication = await Application.findOne({
            project: projectId,
            student: req.student._id
        });

        if (existingApplication) {
            return res.status(400).json({ message: "You have already applied for this project" });
        }

        const application = await Application.create({
            project: projectId,
            student: req.student._id,
            message
        });

        await Student.findByIdAndUpdate(
            req.student._id,
            {
                $push: {
                    appliedProjects: projectId
                }
            }
        );

        return res.status(201).json({
            success: true,
            message: "Applied to project successfully",
            application
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const getAppliedProjects = async (req, res) => {
    try {
        const applications = await Application.find({ student: req.student._id })
            .populate({
                path: "project",
                populate: {
                    path: "professor",
                    select: "name email department designation"
                }
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            applications
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const submitTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        if (!task.assignedTo.map(id => id.toString()).includes(req.student._id.toString())) {
            return res.status(403).json({ message: "You are not assigned to this task" });
        }

        if (task.status === "EXPIRED") {
            return res.status(400).json({ message: "Task deadline has passed. Submission is locked." });
        }

        if (task.status === "SUBMITTED") {
            return res.status(400).json({ message: "Task already submitted" });
        }

        if (new Date() > new Date(task.deadline)) {
            task.status = "EXPIRED";
            await task.save();
            return res.status(400).json({ message: "Task deadline has passed. Submission is locked." });
        }

        const videoLocalPath = req.files?.video?.[0]?.path;
        const imageLocalPaths = req.files?.images?.map(f => f.path) || [];

        if (!videoLocalPath && imageLocalPaths.length === 0) {
            return res.status(400).json({ message: "Please upload at least a video or an image as proof" });
        }

        let submissionVideoUrl = null;
        let submissionImageUrls = [];

        if (videoLocalPath) {
            const uploaded = await uploadResult(videoLocalPath);
            if (!uploaded) return res.status(500).json({ message: "Failed to upload video" });
            submissionVideoUrl = uploaded.url;
        }

        for (const imgPath of imageLocalPaths) {
            const uploaded = await uploadResult(imgPath);
            if (uploaded) submissionImageUrls.push(uploaded.url);
        }

        task.submittedBy = req.student._id;
        task.submissionVideoUrl = submissionVideoUrl;
        task.submissionImageUrls = submissionImageUrls;
        task.submittedAt = new Date();
        task.status = "SUBMITTED";
        await task.save();

        return res.status(200).json({
            success: true,
            message: "Task submitted successfully",
            task
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const downloadCertificate = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId)
            .populate("professor", "name department");

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (project.status !== "COMPLETED") {
            return res.status(400).json({ message: "Certificate is only available after project completion" });
        }

        const application = await Application.findOne({
            project: projectId,
            student: req.student._id,
            status: "ACCEPTED"
        });

        if (!application) {
            return res.status(403).json({ message: "You were not an accepted participant in this project" });
        }

        const student = req.student;
        const studentName = `${student.name.firstname} ${student.name.lastname}`;
        const professorName = `${project.professor.name.firstname} ${project.professor.name.lastname}`;

        generateCertificate(res, {
            studentName,
            projectTitle: project.title,
            professorName,
            department: project.professor.department,
            completedAt: project.completedAt
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const getStudentProfile = async (req, res) => {
    return res.status(200).json({
        success: true,
        student: req.student
    });
};

export const getStudentProjects = async (req, res) => {
    try {
        const projects = await Project.find({ status: "OPEN" })
            .populate("professor", "name email department designation")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: projects
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const getAssignedTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.student._id })
            .populate("project", "title")
            .sort({ deadline: 1 });

        return res.status(200).json({
            success: true,
            tasks
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const getProjectDetails = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await Project.findById(projectId)
            .populate("professor", "name email department designation");
        
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        return res.status(200).json({
            success: true,
            project
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find({
            isActive: true,
            targetAudience: { $in: ["ALL", "STUDENT"] }
        })
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            announcements
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};
