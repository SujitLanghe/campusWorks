import mongoose from "mongoose"

const applicationSchema = new mongoose.Schema({

    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },

    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },

    message: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ["PENDING","ACCEPTED","REJECTED"],
        default: "PENDING"
    }

},{timestamps:true})

module.exports = mongoose.model("Application",applicationSchema)