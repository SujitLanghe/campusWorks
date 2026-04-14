import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true
    },
    semester: {
        type: Number,
        min: 1,
        max: 8
    },
    credits: {
        type: Number,
        default: 3
    }
}, { timestamps: true });

export default mongoose.model("Course", courseSchema);
