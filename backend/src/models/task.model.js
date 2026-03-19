import mongoose from "mongoose"

const taskSchema = new mongoose.Schema({

    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },

    taskNumber: {
        type: Number,
        required: true
    },

    title: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    deadline: {
        type: Date,
        required: true
    },

    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    }],

    status: {
        type: String,
        enum: ["ACTIVE", "SUBMITTED", "EXPIRED", "REWORK_REQUIRED"],
        default: "ACTIVE"
    },

    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    },

    submissionVideoUrl: {
        type: String
    },

    submissionImageUrls: [{
        type: String
    }],

    submittedAt: {
        type: Date
    }

}, { timestamps: true })

export default mongoose.model("Task", taskSchema)