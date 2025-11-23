import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User.js";

export const userRouter = (connection) => {
    if (!connection) throw new Error("User DB connection is required");
    const User = UserModel(connection);
    const router = express.Router();

    // -----------------------------
    // REGISTER USER
    // -----------------------------
    router.post("/register", async (req, res) => {
        try {
            const { name, email, password, profilePic } = req.body;

            // ✅ Check existing user
            const existingUser = await User.findOne({ email });
            if (existingUser)
                return res.status(400).json({ message: "User already exists" });

            // ✅ Model নিজে pre-save hook দিয়ে hash করবে
            const newUser = new User({ name, email, password, profilePic });
            await newUser.save();

            res.status(201).json({
                message: "User created successfully",
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    profilePic: newUser.profilePic,
                },
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });

    // -----------------------------
    // LOGIN USER
    // -----------------------------
    router.post("/login", async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user)
                return res.status(400).json({ message: "Invalid email or password" });

            // ✅ comparePassword method use করা হচ্ছে
            const isMatch = await user.comparePassword(password);
            if (!isMatch)
                return res.status(400).json({ message: "Invalid email or password" });

            const token = jwt.sign(
                { id: user._id, email: user.email, role: user.role, profilePic: user.profilePic, name: user.name },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            res.json({
                message: "Login successful",
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profilePic: user.profilePic,
                },
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });

    // -----------------------------
    // GET ALL USERS
    // -----------------------------
    router.get("/", async (req, res) => {
        try {
            const users = await User.find({}, "-password"); // password বাদ দেওয়া হলো
            res.json(users);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });

    // -----------------------------
    // GET SINGLE USER
    // -----------------------------
    router.get("/:id", async (req, res) => {
        try {
            const user = await User.findById(req.params.id, "-password");
            if (!user) return res.status(404).json({ message: "User not found" });
            res.json(user);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });

    // -----------------------------
    // UPDATE USER
    // -----------------------------
    router.put("/:id", async (req, res) => {
        try {
            const { name, email, password, profilePic } = req.body;
            const updateData = { name, email, profilePic };

            // ✅ password থাকলে model pre-save hook এ hash করবে
            if (password) updateData.password = password;

            const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
                new: true,
                runValidators: true,
            });

            if (!updatedUser)
                return res.status(404).json({ message: "User not found" });

            res.json({
                message: "User updated successfully",
                user: {
                    id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    role: updatedUser.role,
                    profilePic: updatedUser.profilePic,
                },
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });

    // -----------------------------
    // DELETE USER
    // -----------------------------
    router.delete("/:id", async (req, res) => {
        try {
            const deletedUser = await User.findByIdAndDelete(req.params.id);
            if (!deletedUser)
                return res.status(404).json({ message: "User not found" });
            res.json({ message: "User deleted successfully" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });

    return router;
};
