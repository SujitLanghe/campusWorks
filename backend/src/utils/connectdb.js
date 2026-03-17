import mongoose from "mongoose";

const connectDB = async () => {
    if(mongoose.connection.readyState === 1){
        console.log("Already connected to MongoDB");
        return;
    }
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

export default connectDB;
