// src/routes/adminRouter.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AdminModel } from "../models/Admin.js";

export const adminRouter = (connection) => {
    if (!connection) throw new Error("Admin DB connection is required");
    const Admin = AdminModel(connection);
    const router = express.Router();

    // -----------------------------
    // REGISTER ADMIN
    // -----------------------------


    router.post("/register", async (req, res) => {
        try {
            const { email, password, profilePic, name } = req.body;
            const existingAdmin = await Admin.findOne({ email });
            if (existingAdmin) return res.status(400).json({ message: "Admin already exists" });

            const adminId = "ADMIN" + Date.now();
            // শুধু plain password পাঠাও, model pre-save hook হ্যাশ করবে
            const newAdmin = await Admin.create({ adminId, email, password, profilePic: profilePic || "", name: name || "" });

            res.status(201).json({ message: "Admin created successfully", admin: newAdmin });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });


    // -----------------------------
    // LOGIN ADMIN
    // -----------------------------
    router.post("/login", async (req, res) => {
        try {
            const { email, password } = req.body;

            const admin = await Admin.findOne({ email });
            if (!admin)
                return res.status(400).json({ message: "Invalid email or password" });

            // ✅ comparePassword method use করা হচ্ছে
            const isMatch = await admin.comparePassword(password);
            if (!isMatch)
                return res.status(400).json({ message: "Invalid email or password" });

            const token = jwt.sign(
                { id: admin._id, email: admin.email, role: admin.role, profilePic: admin.profilePic, name: admin.name },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            res.json({
                message: "Login successful",
                token,
                user: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    profilePic: admin.profilePic,
                },
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });

    // -----------------------------
    // GET ALL ADMINS
    // -----------------------------
    router.get("/", async (req, res) => {
        try {
            const admins = await Admin.find({});
            res.json(admins);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });

    // -----------------------------
    // GET SINGLE ADMIN
    // -----------------------------
    router.get("/:id", async (req, res) => {
        try {
            const admin = await Admin.findById(req.params.id);
            if (!admin) return res.status(404).json({ message: "Admin not found" });
            res.json(admin);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });

    // -----------------------------
    // UPDATE ADMIN
    // -----------------------------
    router.put("/:id", async (req, res) => {
        try {
            const { email, password, profilePic } = req.body;
            const updateData = { email };

            if (password) {
                const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS));
                updateData.password = await bcrypt.hash(password, salt);
            }

            if (profilePic) updateData.profilePic = profilePic;

            const updatedAdmin = await Admin.findByIdAndUpdate(req.params.id, updateData, { new: true });
            if (!updatedAdmin)
                return res.status(404).json({ message: "Admin not found" });

            res.json({ message: "Admin updated successfully", admin: updatedAdmin });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });

    // -----------------------------
    // DELETE ADMIN
    // -----------------------------
    router.delete("/:id", async (req, res) => {
        try {
            const deletedAdmin = await Admin.findByIdAndDelete(req.params.id);
            if (!deletedAdmin)
                return res.status(404).json({ message: "Admin not found" });
            res.json({ message: "Admin deleted successfully" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });

    return router;
};
