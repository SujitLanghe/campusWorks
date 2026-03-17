import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    skillsRequired: [{
        type: String
    }],

    duration: {
        type: String
    },

    maxStudents: {
        type: Number,
        required: true
    },

    professor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Professor",
        required: true
    },

    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    }],

    status: {
        type: String,
        enum: ["OPEN","ONGOING","COMPLETED"],
        default: "OPEN"
    }

},{timestamps:true})

export default mongoose.model("Project",projectSchema)