import express from "express";
import jwt from "jsonwebtoken";
import { ReporterModel } from "../models/Reporter.js";

export const reporterRouter = (connection) => {
    if (!connection) throw new Error("Reporter DB connection is required");
    const Reporter = ReporterModel(connection);
    const router = express.Router();

    // -----------------------------
    // REGISTER REPORTER
    // -----------------------------
    router.post("/register", async (req, res) => {
        try {
            const { email, password, profilePic, name } = req.body;

            const existingReporter = await Reporter.findOne({ email });
            if (existingReporter)
                return res.status(400).json({ message: "Reporter already exists" });

            const reporterId = "REP" + Date.now();
            const newReporter = await Reporter.create({
                reporterId,
                email,
                password, // hash only in model
                profilePic: profilePic || "",
                name: name || "",
            });

            res
                .status(201)
                .json({ message: "Reporter created successfully", reporter: newReporter });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });

    // -----------------------------
    // LOGIN REPORTER
    // -----------------------------
    router.post("/login", async (req, res) => {
        try {
            const { email, password } = req.body;

            const reporter = await Reporter.findOne({ email });
            if (!reporter)
                return res.status(400).json({ message: "Invalid email or password" });

            const isMatch = await reporter.comparePassword(password);
            if (!isMatch || reporter.role !== "reporter")
                return res.status(400).json({ message: "Invalid email or password" });

            const token = jwt.sign(
                { id: reporter._id, email: reporter.email, reporterId: reporter.reporterId, role: reporter.role, profilePic: reporter.profilePic, name: reporter.name },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );



            res.json({ message: "Login successful", token });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });

    // -----------------------------
    // GET ALL REPORTERS
    // -----------------------------
    router.get("/", async (req, res) => {
        try {
            const reporters = await Reporter.find({});
            reporters.forEach((reporter) => {
                reporter.password = undefined;
            });
            res.json(reporters);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });

    // -----------------------------
    // GET SINGLE REPORTER
    // -----------------------------
    router.get("/:id", async (req, res) => {
        try {
            const reporter = await Reporter.findById(req.params.id);
            if (!reporter) return res.status(404).json({ message: "Reporter not found" });
            res.json(reporter);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });

    // -----------------------------
    // UPDATE REPORTER
    // -----------------------------
    router.put("/:id", async (req, res) => {
        try {
            const { email, password, profilePic, name } = req.body;
            const updateData = { email };

            if (password) updateData.password = password; // hash will happen in model pre-save
            if (profilePic) updateData.profilePic = profilePic;
            if (name) updateData.name = name;
            const updatedReporter = await Reporter.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
            if (!updatedReporter) return res.status(404).json({ message: "Reporter not found" });

            res.json({ message: "Reporter updated successfully", reporter: updatedReporter });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });

    // -----------------------------
    // DELETE REPORTER
    // -----------------------------
    router.delete("/:id", async (req, res) => {
        try {
            const deletedReporter = await Reporter.findByIdAndDelete(req.params.id);
            if (!deletedReporter) return res.status(404).json({ message: "Reporter not found" });

            res.json({ message: "Reporter deleted successfully" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });

    return router;
};
