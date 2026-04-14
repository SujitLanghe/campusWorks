import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ["USER", "PROJECT", "SYSTEM", "ANNOUNCEMENT", "DEPARTMENT"],
        default: "SYSTEM"
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin"
    },
    targetEntity: {
        type: String,
        default: ""
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true });

export default mongoose.model("ActivityLog", activityLogSchema);
