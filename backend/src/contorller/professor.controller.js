import Professor from "../models/professor.model.js";

const generateAccessAndRefreshTokens = async (professorID) => {
    try {
        const professor = await Professor.findById(professorID);
        const accessToken = professor.generateAccessToken();
        const refreshToken = professor.generateRefreshToken();

        professor.refreshToken = refreshToken;
        await professor.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        return null;
    }
};

const registerProfessor = async (req, res) => {
    try {
        const { firstname, lastname, email, password, department, designation } = req.body;

        if (!firstname || !lastname || !email || !password || !department) {
            return res.status(400).json({ message: "All required fields are missing" });
        }

        const existedProfessor = await Professor.findOne({ email });

        if (existedProfessor) {
            return res.status(400).json({ message: "professor already exists" });
        }

        const professor = await Professor.create({
            name: {
                firstname: firstname.toLowerCase(),
                lastname: lastname.toLowerCase()
            },
            email,
            password,
            department,
            designation
        });

        const createdProfessor = await Professor.findById(professor._id).select("-password -refreshToken");

        if (!createdProfessor) {
            return res.status(500).json({ message: "professor can't be registered" });
        }

        return res.status(201).json({
            success: true,
            message: "Professor registered successfully",
            professor: createdProfessor
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const loginProfessor = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const professor = await Professor.findOne({ email });

        if (!professor) {
            return res.status(404).json({ message: "professor does not exist" });
        }

        const isValid = await professor.isPasswordCorrect(password);

        if (!isValid) {
            return res.status(401).json({ message: "password is not valid" });
        }

        const tokens = await generateAccessAndRefreshTokens(professor._id);
        if (!tokens) {
            return res.status(500).json({ message: "Failed to generate tokens" });
        }

        const { accessToken, refreshToken } = tokens;

        const loggedProfessor = await Professor.findById(professor._id).select("-password -refreshToken");

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
                message: "professor logged in successfully",
                professor: loggedProfessor,
                accessToken,
                refreshToken
            });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const logoutProfessor = async (req, res) => {
    try {
        await Professor.findByIdAndUpdate(
            req.professor._id,
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
                message: "professor logged out"
            });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export {
    registerProfessor,
    loginProfessor,
    logoutProfessor
};
