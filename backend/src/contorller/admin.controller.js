import Admin from "../models/admin.model.js";

const generateAccessAndRefreshTokens = async (adminID) => {
    try {
        const admin = await Admin.findById(adminID);
        const accessToken = admin.generateAccessToken();
        const refreshToken = admin.generateRefreshToken();

        admin.refreshToken = refreshToken;
        await admin.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        return null;
    }
};

const registerAdmin = async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;

        if (!firstname || !lastname || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existedAdmin = await Admin.findOne({ email });

        if (existedAdmin) {
            return res.status(400).json({ message: "admin already exists" });
        }

        const admin = await Admin.create({
            name: {
                firstname: firstname.toLowerCase(),
                lastname: lastname.toLowerCase()
            },
            email,
            password
        });

        const createdAdmin = await Admin.findById(admin._id).select("-password -refreshToken");

        if (!createdAdmin) {
            return res.status(500).json({ message: "admin can't be registered" });
        }

        return res.status(201).json({
            success: true,
            message: "Admin registered successfully",
            admin: createdAdmin
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(404).json({ message: "admin does not exist" });
        }

        const isValid = await admin.isPasswordCorrect(password);

        if (!isValid) {
            return res.status(401).json({ message: "password is not valid" });
        }

        const tokens = await generateAccessAndRefreshTokens(admin._id);
        if (!tokens) {
            return res.status(500).json({ message: "Failed to generate tokens" });
        }

        const { accessToken, refreshToken } = tokens;

        const loggedAdmin = await Admin.findById(admin._id).select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
                success: true,
                message: "admin logged in successfully",
                admin: loggedAdmin,
                accessToken,
                refreshToken
            });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const logoutAdmin = async (req, res) => {
    try {
        await Admin.findByIdAndUpdate(
            req.admin._id,
            {
                $set: {
                    refreshToken: undefined
                }
            },
            {
                new: true
            }
        );

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        };

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({
                success: true,
                message: "admin logged out"
            });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export {
    registerAdmin,
    loginAdmin,
    logoutAdmin
};
