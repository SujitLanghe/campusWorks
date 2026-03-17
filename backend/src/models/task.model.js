const mongoose = require("mongoose")

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

    status: {
        type: String,
        enum: ["ACTIVE","COMPLETED","EXPIRED"],
        default: "ACTIVE"
    }

},{timestamps:true})

module.exports = mongoose.model("Task",taskSchema)