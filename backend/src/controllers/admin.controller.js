import Admin from "../models/admin.model.js";
import Project from "../models/project.model.js";
import Student from "../models/student.model.js";
import Professor from "../models/professor.model.js";
import Application from "../models/application.model.js";
import Department from "../models/department.model.js";
import Course from "../models/course.model.js";
import Announcement from "../models/announcement.model.js";
import ActivityLog from "../models/activityLog.model.js";

// ─── Helper: Log an activity ───
const logActivity = async (action, category, performedBy, targetEntity = "", metadata = {}) => {
    try {
        await ActivityLog.create({ action, category, performedBy, targetEntity, metadata });
    } catch (err) {
        console.error("Activity log failed:", err.message);
    }
};

const generateAccessAndRefreshTokens = async (adminID) => {
    try {
        const admin = await Admin.findById(adminID);
        const accessToken = admin.generateAccessToken();
        const refreshToken = admin.generateRefreshToken();

        admin.refreshToken = refreshToken;
        await admin.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        return null;
    }
};

const registerAdmin = async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;

        if (!firstname || !lastname || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existedAdmin = await Admin.findOne({ email });

        if (existedAdmin) {
            return res.status(400).json({ message: "admin already exists" });
        }

        const admin = await Admin.create({
            name: {
                firstname: firstname.toLowerCase(),
                lastname: lastname.toLowerCase()
            },
            email,
            password
        });

        const createdAdmin = await Admin.findById(admin._id).select("-password -refreshToken");

        if (!createdAdmin) {
            return res.status(500).json({ message: "admin can't be registered" });
        }

        return res.status(201).json({
            success: true,
            message: "Admin registered successfully",
            admin: createdAdmin
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(404).json({ message: "admin does not exist" });
        }

        const isValid = await admin.isPasswordCorrect(password);

        if (!isValid) {
            return res.status(401).json({ message: "password is not valid" });
        }

        const tokens = await generateAccessAndRefreshTokens(admin._id);
        if (!tokens) {
            return res.status(500).json({ message: "Failed to generate tokens" });
        }

        const { accessToken, refreshToken } = tokens;

        const loggedAdmin = await Admin.findById(admin._id).select("-password -refreshToken");

        const isProd = process.env.NODE_ENV === "production";
        const options = {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "None" : "Lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        };

        await logActivity("Admin logged in", "SYSTEM", admin._id, "Admin");

        return res
            .status(200)
            .cookie("adminAccessToken", accessToken, options)
            .cookie("adminRefreshToken", refreshToken, options)
            .json({
                success: true,
                message: "admin logged in successfully",
                admin: loggedAdmin,
                accessToken,
                refreshToken
            });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const logoutAdmin = async (req, res) => {
    try {
        await Admin.findByIdAndUpdate(
            req.admin._id,
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
            .clearCookie("adminAccessToken", options)
            .clearCookie("adminRefreshToken", options)
            .json({
                success: true,
                message: "admin logged out"
            });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const getAllProjects = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const skip = (page - 1) * limit;

        const projects = await Project.find()
            .populate("professor", "name department email")
            .populate("students", "name email enrollmentno department")
            .limit(Number(limit))
            .skip(Number(skip))
            .sort({ createdAt: -1 });

        const totalProjects = await Project.countDocuments();

        return res.status(200).json({
            success: true,
            projects,
            pagination: {
                totalProjects,
                currentPage: Number(page),
                totalPages: Math.ceil(totalProjects / limit),
                limit: Number(limit)
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const getAllInternships = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const applications = await Application.find({ status: "ACCEPTED" })
            .populate("student", "name email enrollmentno department year")
            .populate({
                path: "project",
                populate: { path: "professor", select: "name department email" }
            })
            .limit(Number(limit))
            .skip(Number(skip))
            .sort({ createdAt: -1 });

        const total = await Application.countDocuments({ status: "ACCEPTED" });

        return res.status(200).json({
            success: true,
            internships: applications,
            pagination: {
                total,
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
                limit: Number(limit)
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const getAllProfessors = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const professors = await Professor.find()
            .select("-password -refreshToken")
            .populate({
                path: "publishedProjects",
                select: "title status description students",
                populate: {
                    path: "students",
                    select: "name email enrollmentno department"
                }
            })
            .limit(Number(limit))
            .skip(Number(skip))
            .sort({ createdAt: -1 });

        const total = await Professor.countDocuments();

        return res.status(200).json({
            success: true,
            professors,
            pagination: {
                total,
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
                limit: Number(limit)
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const getAllStudents = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const students = await Student.find()
            .select("-password -refreshToken")
            .populate({
                path: "appliedProjects",
                select: "title status professor",
                populate: {
                    path: "professor",
                    select: "name department"
                }
            })
            .limit(Number(limit))
            .skip(Number(skip))
            .sort({ createdAt: -1 });

        const total = await Student.countDocuments();

        return res.status(200).json({
            success: true,
            students,
            pagination: {
                total,
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
                limit: Number(limit)
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const getAdminProfile = async (req, res) => {
    return res.status(200).json({
        success: true,
        admin: req.admin
    });
};

const getAdminDashboardStats = async (req, res) => {
    try {
        const [
            totalStudents,
            totalProfessors,
            totalProjects,
            activeInternships,
            completedProjects,
            professorsInInternship,
            totalDepartments,
            totalCourses,
            activeAnnouncements
        ] = await Promise.all([
            Student.countDocuments(),
            Professor.countDocuments(),
            Project.countDocuments(),
            Application.countDocuments({ status: "ACCEPTED" }),
            Project.countDocuments({ status: "COMPLETED" }),
            Project.distinct("professor", { students: { $exists: true, $not: { $size: 0 } } })
                .then(ids => ids.length),
            Department.countDocuments(),
            Course.countDocuments(),
            Announcement.countDocuments({ isActive: true })
        ]);

        return res.status(200).json({
            success: true,
            stats: {
                totalStudents,
                totalProfessors,
                totalProjects,
                activeInternships,
                completedProjects,
                professorsInInternship,
                totalDepartments,
                totalCourses,
                activeAnnouncements
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const getRecentActivities = async (req, res) => {
    try {
        // Get last 10 applications
        const applications = await Application.find()
            .populate("student", "name email")
            .populate("project", "title")
            .sort({ createdAt: -1 })
            .limit(10);

        const activities = applications.map(app => ({
            _id: app._id,
            type: "APPLICATION",
            student: app.student?.name,
            project: app.project?.title,
            status: app.status,
            timestamp: app.createdAt
        }));

        return res.status(200).json({
            success: true,
            activities
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const getProfessorDetails = async (req, res) => {
    try {
        const { professorId } = req.params;

        const professor = await Professor.findById(professorId)
            .select("-password -refreshToken")
            .populate({
                path: "publishedProjects",
                populate: {
                    path: "students",
                    select: "name email enrollmentno department year"
                }
            });

        if (!professor) {
            return res.status(404).json({ message: "Professor not found" });
        }

        return res.status(200).json({
            success: true,
            professor
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const getStudentDetails = async (req, res) => {
    try {
        const { studentId } = req.params;

        const student = await Student.findById(studentId)
            .select("-password -refreshToken")
            .populate({
                path: "appliedProjects",
                populate: {
                    path: "professor",
                    select: "name department email"
                }
            });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        return res.status(200).json({
            success: true,
            student
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const createStudentByAdmin = async (req, res) => {
    try {
        const { firstname, lastname, email, enrollmentno, password, department, year, phone } = req.body;

        if ([firstname, lastname, email, enrollmentno, password, department, year, phone].some(field => !field || !field.trim())) {
            return res.status(400).json({ message: "All fields are required for student registration" });
        }

        const existedStudent = await Student.findOne({ $or: [{ enrollmentno }, { email }] });
        if (existedStudent) {
            return res.status(400).json({ message: "Student with this enrollment or email already exists" });
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
            phone
        });

        const createdStudent = await Student.findById(student._id).select("-password -refreshToken");

        await logActivity(`Created student: ${firstname} ${lastname}`, "USER", req.admin._id, "Student", { studentId: student._id });

        return res.status(201).json({
            success: true,
            message: "Student created successfully by Admin",
            student: createdStudent
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const createProfessorByAdmin = async (req, res) => {
    try {
        const { firstname, lastname, email, password, department, designation, researchArea } = req.body;

        if (!firstname || !lastname || !email || !password || !department || !designation) {
            return res.status(400).json({ message: "All required fields are missing for professor registration" });
        }

        const existedProfessor = await Professor.findOne({ email });
        if (existedProfessor) {
            return res.status(400).json({ message: "Professor with this email already exists" });
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

        await logActivity(`Onboarded professor: ${firstname} ${lastname}`, "USER", req.admin._id, "Professor", { professorId: professor._id });

        return res.status(201).json({
            success: true,
            message: "Professor created successfully by Admin",
            professor: createdProfessor
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

// ─── Department CRUD ───

const createDepartment = async (req, res) => {
    try {
        const { name, code, description, headOfDepartment } = req.body;

        if (!name || !code) {
            return res.status(400).json({ message: "Department name and code are required" });
        }

        const existing = await Department.findOne({ $or: [{ name }, { code: code.toUpperCase() }] });
        if (existing) {
            return res.status(400).json({ message: "Department with this name or code already exists" });
        }

        const department = await Department.create({ name, code: code.toUpperCase(), description, headOfDepartment });

        await logActivity(`Created department: ${name} (${code})`, "DEPARTMENT", req.admin._id, "Department", { departmentId: department._id });

        return res.status(201).json({
            success: true,
            message: "Department created successfully",
            department
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find().sort({ name: 1 });

        // Count students and professors per department
        const enriched = await Promise.all(departments.map(async (dept) => {
            const studentCount = await Student.countDocuments({ department: dept.code });
            const professorCount = await Professor.countDocuments({ department: dept.code });
            const courseCount = await Course.countDocuments({ department: dept._id });
            return {
                ...dept.toObject(),
                studentCount,
                professorCount,
                courseCount
            };
        }));

        return res.status(200).json({
            success: true,
            departments: enriched
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const deleteDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params;
        const dept = await Department.findById(departmentId);

        if (!dept) {
            return res.status(404).json({ message: "Department not found" });
        }

        // Delete associated courses
        await Course.deleteMany({ department: departmentId });
        await Department.findByIdAndDelete(departmentId);

        await logActivity(`Deleted department: ${dept.name}`, "DEPARTMENT", req.admin._id, "Department");

        return res.status(200).json({
            success: true,
            message: "Department and associated courses deleted"
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

// ─── Course CRUD ───

const createCourse = async (req, res) => {
    try {
        const { name, code, department, semester, credits } = req.body;

        if (!name || !code || !department) {
            return res.status(400).json({ message: "Course name, code, and department are required" });
        }

        const existing = await Course.findOne({ code: code.toUpperCase() });
        if (existing) {
            return res.status(400).json({ message: "Course with this code already exists" });
        }

        const course = await Course.create({ name, code: code.toUpperCase(), department, semester, credits });

        await logActivity(`Created course: ${name} (${code})`, "DEPARTMENT", req.admin._id, "Course", { courseId: course._id });

        return res.status(201).json({
            success: true,
            message: "Course created successfully",
            course
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const getCourses = async (req, res) => {
    try {
        const { departmentId } = req.query;
        const filter = departmentId ? { department: departmentId } : {};
        const courses = await Course.find(filter)
            .populate("department", "name code")
            .sort({ name: 1 });

        return res.status(200).json({
            success: true,
            courses
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        await Course.findByIdAndDelete(courseId);

        await logActivity(`Deleted course: ${course.name}`, "DEPARTMENT", req.admin._id, "Course");

        return res.status(200).json({
            success: true,
            message: "Course deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

// ─── Announcement CRUD ───

const createAnnouncement = async (req, res) => {
    try {
        const { title, content, targetAudience, priority } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required" });
        }

        const announcement = await Announcement.create({
            title,
            content,
            targetAudience: targetAudience || "ALL",
            priority: priority || "MEDIUM",
            createdBy: req.admin._id
        });

        await logActivity(`Published announcement: ${title}`, "ANNOUNCEMENT", req.admin._id, "Announcement", { announcementId: announcement._id });

        return res.status(201).json({
            success: true,
            message: "Announcement published successfully",
            announcement
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find()
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

const deleteAnnouncement = async (req, res) => {
    try {
        const { announcementId } = req.params;
        const announcement = await Announcement.findById(announcementId);

        if (!announcement) {
            return res.status(404).json({ message: "Announcement not found" });
        }

        await Announcement.findByIdAndDelete(announcementId);

        await logActivity(`Deleted announcement: ${announcement.title}`, "ANNOUNCEMENT", req.admin._id, "Announcement");

        return res.status(200).json({
            success: true,
            message: "Announcement deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const toggleAnnouncement = async (req, res) => {
    try {
        const { announcementId } = req.params;
        const announcement = await Announcement.findById(announcementId);

        if (!announcement) {
            return res.status(404).json({ message: "Announcement not found" });
        }

        announcement.isActive = !announcement.isActive;
        await announcement.save();

        return res.status(200).json({
            success: true,
            message: `Announcement ${announcement.isActive ? "activated" : "deactivated"}`,
            announcement
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

// ─── Activity Logs / Analytics ───

const getActivityLogs = async (req, res) => {
    try {
        const { page = 1, limit = 20, category } = req.query;
        const skip = (page - 1) * limit;
        const filter = category ? { category } : {};

        const logs = await ActivityLog.find(filter)
            .populate("performedBy", "name email")
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(Number(skip));

        const total = await ActivityLog.countDocuments(filter);

        return res.status(200).json({
            success: true,
            logs,
            pagination: {
                total,
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
                limit: Number(limit)
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const getSystemAnalytics = async (req, res) => {
    try {
        // Growth over time - students created per month (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const [studentGrowth, professorGrowth, projectGrowth, departmentBreakdown, recentLogs] = await Promise.all([
            Student.aggregate([
                { $match: { createdAt: { $gte: sixMonthsAgo } } },
                { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]),
            Professor.aggregate([
                { $match: { createdAt: { $gte: sixMonthsAgo } } },
                { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]),
            Project.aggregate([
                { $match: { createdAt: { $gte: sixMonthsAgo } } },
                { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]),
            Student.aggregate([
                { $group: { _id: "$department", count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            ActivityLog.find()
                .populate("performedBy", "name")
                .sort({ createdAt: -1 })
                .limit(15)
        ]);

        return res.status(200).json({
            success: true,
            analytics: {
                studentGrowth,
                professorGrowth,
                projectGrowth,
                departmentBreakdown,
                recentLogs
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export {
    registerAdmin,
    loginAdmin,
    logoutAdmin,
    getAllProjects,
    getAllInternships,
    getAllProfessors,
    getAllStudents,
    getAdminProfile,
    getAdminDashboardStats,
    getRecentActivities,
    getProfessorDetails,
    getStudentDetails,
    createStudentByAdmin,
    createProfessorByAdmin,
    createDepartment,
    getDepartments,
    deleteDepartment,
    createCourse,
    getCourses,
    deleteCourse,
    createAnnouncement,
    getAnnouncements,
    deleteAnnouncement,
    toggleAnnouncement,
    getActivityLogs,
    getSystemAnalytics
};
