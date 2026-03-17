import Professor from "../models/professor.model.js";
import Application from "../models/application.model.js";
import Project from "../models/project.model.js";
import Task from "../models/task.model.js";

const generateAccessAndRefreshTokens = async (professorID) => {
    try {
        const professor = await Professor.findById(professorID);
        const accessToken = professor.generateAccessToken();
        const refreshToken = professor.generateRefreshToken();

        professor.refreshToken = refreshToken;
        await professor.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        return null;
    }
};

const registerProfessor = async (req, res) => {
    try {
        const { firstname, lastname, email, password, department, designation, researchArea } = req.body;

        if (!firstname || !lastname || !email || !password || !department) {
            return res.status(400).json({ message: "All required fields are missing" });
        }

        const existedProfessor = await Professor.findOne({ email });

        if (existedProfessor) {
            return res.status(400).json({ message: "professor already exists" });
        }

        const professor = await Professor.create({
            name: {
                firstname: firstname.toLowerCase(),
                lastname: lastname.toLowerCase()
            },
            email,
            password,
            department,
            designation,
            researchArea: Array.isArray(researchArea) ? researchArea : researchArea?.split(",").map(area => area.trim())
        });

        const createdProfessor = await Professor.findById(professor._id).select("-password -refreshToken");

        if (!createdProfessor) {
            return res.status(500).json({ message: "professor can't be registered" });
        }

        return res.status(201).json({
            success: true,
            message: "Professor registered successfully",
            professor: createdProfessor
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const loginProfessor = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const professor = await Professor.findOne({ email });

        if (!professor) {
            return res.status(404).json({ message: "professor does not exist" });
        }

        const isValid = await professor.isPasswordCorrect(password);

        if (!isValid) {
            return res.status(401).json({ message: "password is not valid" });
        }

        const tokens = await generateAccessAndRefreshTokens(professor._id);
        if (!tokens) {
            return res.status(500).json({ message: "Failed to generate tokens" });
        }

        const { accessToken, refreshToken } = tokens;

        const loggedProfessor = await Professor.findById(professor._id).select("-password -refreshToken");

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
                message: "professor logged in successfully",
                professor: loggedProfessor,
                accessToken,
                refreshToken
            });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const logoutProfessor = async (req, res) => {
    try {
        await Professor.findByIdAndUpdate(
            req.professor._id,
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
                message: "professor logged out"
            });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const publishProject = async (req, res) => {
    try {
        const { title, description, skillsRequired, duration, maxStudents } = req.body;

        if (!title || !description || !maxStudents) {
            return res.status(400).json({ message: "Title, description and maxStudents are required" });
        }

        const project = await Project.create({
            title,
            description,
            skillsRequired,
            duration,
            maxStudents,
            professor: req.professor._id
        });

        await Professor.findByIdAndUpdate(
            req.professor._id,
            {
                $push: {
                    publishedProjects: project._id
                }
            }
        );

        return res.status(201).json({
            success: true,
            message: "Project published successfully",
            project
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const getApplicationsForProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (project.professor.toString() !== req.professor._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to view applications for this project" });
        }

        const applications = await Application.find({ project: projectId })
            .populate("student", "name email enrollmentno department year skills resumeUrl github linkedin")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            applications
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const acceptApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const application = await Application.findById(applicationId).populate("project");

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        const project = application.project;

        if (project.professor.toString() !== req.professor._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to accept applications for this project" });
        }

        if (project.status !== "OPEN") {
            return res.status(400).json({ message: "Project is no longer open" });
        }

        if (application.status === "ACCEPTED") {
            return res.status(400).json({ message: "Application already accepted" });
        }

        application.status = "ACCEPTED";
        await application.save();

        project.students.push(application.student);

        if (project.students.length >= project.maxStudents) {
            project.status = "ONGOING";
        }

        await project.save();

        return res.status(200).json({
            success: true,
            message: "Application accepted successfully",
            application
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const assignTask = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { title, description, deadline } = req.body;

        if (!title || !deadline) {
            return res.status(400).json({ message: "Title and deadline are required" });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (project.professor.toString() !== req.professor._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to assign tasks to this project" });
        }

        if (project.status === "COMPLETED") {
            return res.status(400).json({ message: "Cannot assign tasks to a completed project" });
        }

        const taskNumber = (project.tasks?.length || 0) + 1;

        const task = await Task.create({
            project: projectId,
            taskNumber,
            title,
            description,
            deadline: new Date(deadline),
            assignedTo: project.students
        });

        await Project.findByIdAndUpdate(projectId, {
            $push: { tasks: task._id }
        });

        return res.status(201).json({
            success: true,
            message: "Task assigned successfully",
            task
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const markProjectComplete = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (project.professor.toString() !== req.professor._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to complete this project" });
        }

        if (project.status === "COMPLETED") {
            return res.status(400).json({ message: "Project is already completed" });
        }

        project.status = "COMPLETED";
        project.completedAt = new Date();
        await project.save();

        return res.status(200).json({
            success: true,
            message: "Project marked as completed",
            project
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export {
    registerProfessor,
    loginProfessor,
    logoutProfessor,
    publishProject,
    getApplicationsForProject,
    acceptApplication,
    assignTask,
    markProjectComplete
};
