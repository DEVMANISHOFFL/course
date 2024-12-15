import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";

export const register = async (req, res) => {
    try {

        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required. "
            })
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "User already Exist with this email."
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashedPassword
        })
        return res.status(201).json({
            success: true,
            message: "Account created successfully."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to register"
        })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Incorrect Email or Password"
            });
        }
        const isPassword = await bcrypt.compare(password, user.password);
        if (!isPassword) {
            return res.status(400).json({
                success: false,
                message: "Incorrect email or password"
            });
        }
        generateToken(res, user, `Welcome Back ${user.name}`);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to login"
        })
    }
}

export const logout = async (_, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "Logged out successfully",
            sucess: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to logout"
        })
    }
}

export const getUserProfile = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "Profile not found",
                sucess: false
            })
        }
        return res.status(200).json({
            sucess: true,
            user
        })
    } catch {
        // console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to login"
        })
    }
}

export const UpdateProfile = async (req, res) => {
    try {
        const userId = req.id;
        console.log("User ID from req.id:", userId);

        if (!userId) {
            return res.status(400).json({
                message: "User is not authenticated",
                success: false
            });
        }

        const { name } = req.body;
        const profilePhoto = req.file;

        console.log("Uploaded file:", profilePhoto);
        
        if (!profilePhoto) {
            return res.status(400).json({
                message: "Profile photo is required",
                success: false
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        // Extract the public ID of the old image
        if (user.photoUrl) {
            const publicId = user.photoUrl.split("/").pop().split(".")[0];
            deleteMediaFromCloudinary(publicId);
        }

        // Upload new photo to Cloudinary
        const cloudResponse = await uploadMedia(profilePhoto.path);
        console.log("Cloudinary response:", cloudResponse);

        if (!cloudResponse || !cloudResponse.secure_url) {
            return res.status(500).json({
                message: "Failed to upload image to Cloudinary",
                success: false
            });
        }

        const photoUrl = cloudResponse.secure_url;
        const updatedData = { name, photoUrl };

        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true }).select("-password");

        return res.status(200).json({
            success: true,
            user: updatedUser,
            message: "Profile updated successfully."
        });

    } catch (error) {
        console.log("Error during profile update:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update profile"
        });
    }
};
