import { generateToken } from '../lib/utils.js';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import cloudinary from '../lib/cloudinary.js';

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        generateToken(newUser._id, res);

        res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            profilePic: newUser.profilePic,
        });
    } catch (error) {
        console.error("Error in signup:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.error("Error in login:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const logout = (req, res) => {
    try {
        res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Error in logout:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateProfile = async (req, res) => {
    try {
      const { profilePic } = req.body;
      const userId = req.user?._id;
  
      console.log(">>> Incoming profile update");
      console.log("User ID:", userId);
      console.log("Profile Pic Exists:", !!profilePic);
      console.log("Profile Pic Sample (first 100):", profilePic?.substring(0, 100));
  
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized - User not found in req.user" });
      }
  
      if (!profilePic) {
        return res.status(400).json({ message: "Profile pic is required" });
      }
  
      // Uploading to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(profilePic, {
        resource_type: "image",
      });
  
      console.log("Cloudinary Upload Response:", uploadResponse);
  
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: uploadResponse.secure_url },
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found for update" });
      }
  
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("🚨 Error in updateProfile:", error);
      res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  };
  

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.error("Error in checkAuth:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
