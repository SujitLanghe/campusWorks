import cron from "node-cron";
import Task from "../models/task.model.js";

// Runs every hour to expire overdue tasks
const startTaskExpiryCron = () => {
    cron.schedule("0 * * * *", async () => {
        try {
            const now = new Date();
            const result = await Task.updateMany(
                {
                    status: "ACTIVE",
                    deadline: { $lt: now }
                },
                {
                    $set: { status: "EXPIRED" }
                }
            );
            if (result.modifiedCount > 0) {
                console.log(`[CRON] Expired ${result.modifiedCount} overdue task(s) at ${now.toISOString()}`);
            }
        } catch (error) {
            console.error("[CRON] Error expiring tasks:", error.message);
        }
    });

    console.log("[CRON] Task expiry cron job started — runs every hour");
};

export { startTaskExpiryCron };
