import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Models
import Admin from "../models/admin.model.js";
import Professor from "../models/professor.model.js";
import Student from "../models/student.model.js";
import Project from "../models/project.model.js";
import Task from "../models/task.model.js";
import Application from "../models/application.model.js";

import connectDB from "./connectdb.js";

// Setup __dirname for ES modules to load the .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const seedDatabase = async () => {
    try {
        console.log("Connecting to database...");
        await connectDB();

        console.log("Clearing existing collections...");
        await Admin.deleteMany({});
        await Professor.deleteMany({});
        await Student.deleteMany({});
        await Project.deleteMany({});
        await Task.deleteMany({});
        await Application.deleteMany({});

        console.log("Seeding Admin...");
        const admin = new Admin({
            name: { firstname: "Rajesh", lastname: "Sharma" },
            email: "rajeshsharma@campusworks.edu",
            password: "password123",
            role: "ADMIN"
        });
        await admin.save();

        console.log("Seeding Professors...");
        const prof1 = new Professor({
            name: { firstname: "Dr. Vikram", lastname: "Singh" },
            email: "vikramsingh@campusworks.edu",
            password: "password123",
            department: "Computer Science",
            designation: "Associate Professor",
            researchArea: ["Machine Learning", "Natural Language Processing"]
        });
        await prof1.save();

        const prof2 = new Professor({
            name: { firstname: "Dr. Priya", lastname: "Desai" },
            email: "priyadesai@campusworks.edu",
            password: "password123",
            department: "Information Technology",
            designation: "Assistant Professor",
            researchArea: ["Cybersecurity", "Blockchain"]
        });
        await prof2.save();

        console.log("Seeding Students...");
        const student1 = new Student({
            name: { firstname: "Ananya", lastname: "Gupta" },
            enrollmentno: "ENR2023001",
            email: "ananyagupta@campusworks.edu",
            password: "password123",
            department: "CS",
            year: "BE",
            skills: ["React", "Node.js", "MongoDB"],
            phone: "+1234567890",
            github: "https://github.com/ananyagupta",
            linkedin: "https://linkedin.com/in/ananyagupta"
        });
        await student1.save();

        const student2 = new Student({
            name: { firstname: "Rohan", lastname: "Patil" },
            enrollmentno: "ENR2024042",
            email: "rohanpatil@campusworks.edu",
            password: "password123",
            department: "IT",
            year: "TY",
            skills: ["Python", "TensorFlow", "Pandas"],
            phone: "+1987654321",
            github: "https://github.com/rohanpatil",
            linkedin: "https://linkedin.com/in/rohanpatil"
        });
        await student2.save();

        const student3 = new Student({
            name: { firstname: "Neha", lastname: "Joshi" },
            enrollmentno: "ENR2025110",
            email: "nehajoshi@campusworks.edu",
            password: "password123",
            department: "AI",
            year: "SY",
            skills: ["Java", "Spring Boot", "SQL"],
            phone: "+1122334455",
            github: "https://github.com/nehajoshi",
            linkedin: "https://linkedin.com/in/nehajoshi"
        });
        await student3.save();

        console.log("Seeding Projects...");
        const project1 = new Project({
            title: "Campus Smart Attendance System",
            description: "Develop a facial recognition-based attendance system using React for the interface and Python for the deep learning models.",
            skillsRequired: ["React", "Python", "Computer Vision"],
            duration: "3 months",
            maxStudents: 3,
            professor: prof1._id,
            status: "OPEN"
        });
        await project1.save();

        const project2 = new Project({
            title: "Decentralized Credential Verification",
            description: "A blockchain solution to verify and store student academic credentials securely.",
            skillsRequired: ["Solidity", "Node.js", "Blockchain"],
            duration: "4 months",
            maxStudents: 2,
            professor: prof2._id,
            status: "ONGOING",
            students: [student1._id]
        });
        await project2.save();

        const project3 = new Project({
            title: "Predictive Academic Analytics",
            description: "Machine learning model to predict student performance based on historical learning patterns.",
            skillsRequired: ["Machine Learning", "Pandas", "Python", "Data Visualization"],
            duration: "6 months",
            maxStudents: 4,
            professor: prof1._id,
            status: "OPEN"
        });
        await project3.save();

        // Update professors with their projects
        prof1.publishedProjects.push(project1._id, project3._id);
        await prof1.save();

        prof2.publishedProjects.push(project2._id);
        await prof2.save();

        // Update student with ongoing project
        student1.appliedProjects.push(project2._id);
        await student1.save();

        console.log("Seeding Tasks...");
        const task1 = new Task({
            project: project2._id,
            taskNumber: 1,
            title: "Smart Contract Blueprint",
            description: "Draft the smart contract interface for storing credentials.",
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            assignedTo: [student1._id],
            status: "ACTIVE"
        });
        await task1.save();

        const task2 = new Task({
            project: project2._id,
            taskNumber: 2,
            title: "Frontend Node Integration",
            description: "Setup Web3.js to communicate with the local Ganache node.",
            deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            assignedTo: [student1._id],
            status: "ACTIVE"
        });
        await task2.save();

        project2.tasks.push(task1._id, task2._id);
        await project2.save();

        console.log("Seeding Applications...");
        const application1 = new Application({
            project: project1._id,
            student: student2._id,
            message: "I have strong foundations in Python and eager to learn Computer Vision.",
            status: "PENDING"
        });
        await application1.save();

        const application2 = new Application({
            project: project3._id,
            student: student3._id,
            message: "I love predictive analytics and have worked with Pandas recently.",
            status: "PENDING"
        });
        await application2.save();
        
        const application3 = new Application({
            project: project2._id,
            student: student1._id,
            message: "I am confident in my Node.js and basic Blockchain capabilities.",
            status: "ACCEPTED"
        });
        await application3.save();

        console.log("Database seeded successfully! 🎉");
        process.exit(0);

    } catch (error) {
        console.error("Error seeding the database: ", error);
        process.exit(1);
    }
};

seedDatabase();
