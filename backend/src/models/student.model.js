import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const yearEnum = ["FY","SY","TY","BE"]
const dept = ["IT","CS","ENTC","MECH","AI"]

const studentSchema = new mongoose.Schema({
    name:{
        firstname : {
            type:String,
            required:true
        },
        lastname : {
            type:String,
            required:true
        }
    },
    enrollmentno:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    department:{
        type:String,
        enum:dept,
        required:true
    },
    year:{
        type:String,
        enum:yearEnum,
        required:true,
    },
    skills:[{
        type:String
    }],
    resumeUrl:{
        type:String
    },
    phone:{
        type:String,
        required:true
    },
    github:{
        type:String
    },
    linkedin:{
        type:String
    },
    appliedProjects:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Project"
    }],
    refreshToken:{
        type:String
    }
},{timestamps:true})



// Hash password before saving
studentSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});


// Check if password is correct
studentSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};


// Generate access token
studentSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            firstname: this.name.firstname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

// Generate refresh token
studentSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            firstname: this.name.firstname,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export default mongoose.model("Student",studentSchema)