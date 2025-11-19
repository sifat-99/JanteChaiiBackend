import express from "express";
import { NewsModel } from "../models/News.js";
import jwt from "jsonwebtoken";

export const newsRouter = (connection) => {
    const News = NewsModel(connection);
    const router = express.Router();

    // -----------------------------
    // Middleware: optional reporterAuth
    // -----------------------------
    const reporterAuthOptional = (req, res, next) => {
        const token = req.headers.authorization;
        if (!token) return next(); // Token missing → skip auth
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.reporter = decoded; // email, id, reporterId
            next();
        } catch (err) {
            next(); // invalid token → skip auth
        }
    };

    // -----------------------------
    // PUBLISH NEWS
    // -----------------------------
    router.post("/publish", reporterAuthOptional, async (req, res) => {
        try {
            const { title, description, pictureUrl, category, reporterEmail } = req.body;
            const email = req.reporter?.email || reporterEmail;
            if (!email) return res.status(400).json({ message: "Reporter email required" });

            const news = new News({
                title,
                description,
                pictureUrl: pictureUrl || "",
                category: category || "General",
                reporterEmail: email,
                publishedAt: new Date(),
                comments: [] // empty array by default
            });

            await news.save();
            res.json({ message: "News published successfully", news });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });

    // -----------------------------
    // UPDATE NEWS BY ID
    // -----------------------------
    router.put("/:id", reporterAuthOptional, async (req, res) => {
        try {
            const { title, description, pictureUrl, category, reporterEmail } = req.body;
            const email = req.reporter?.email || reporterEmail;
            if (!email) return res.status(400).json({ message: "Reporter email required" });

            const updatedNews = await News.findOneAndUpdate(
                { _id: req.params.id, reporterEmail: email },
                { title, description, pictureUrl, category },
                { new: true, runValidators: true }
            );

            if (!updatedNews)
                return res.status(404).json({ message: "News not found or unauthorized" });

            res.json({ message: "News updated successfully", news: updatedNews });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });

    // -----------------------------
    // DELETE NEWS BY ID
    // -----------------------------
    router.delete("/:id", reporterAuthOptional, async (req, res) => {
        try {
            const email = req.reporter?.email || req.body.reporterEmail;
            if (!email) return res.status(400).json({ message: "Reporter email required" });

            const deletedNews = await News.findOneAndDelete({ _id: req.params.id, reporterEmail: email });
            if (!deletedNews)
                return res.status(404).json({ message: "News not found or unauthorized" });

            res.json({ message: "News deleted successfully" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });

    // -----------------------------
    // GET ALL NEWS
    // -----------------------------
    router.get("/", async (req, res) => {
        try {
            const newsList = await News.find().sort({ publishedAt: -1 });
            res.json({ total: newsList.length, news: newsList });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });

    // -----------------------------
    // GET NEWS BY REPORTER EMAIL
    // -----------------------------
    router.get("/by-reporter/:email", async (req, res) => {
        try {
            const newsList = await News.find({ reporterEmail: req.params.email }).sort({ publishedAt: -1 });
            res.json({ reporterEmail: req.params.email, total: newsList.length, news: newsList });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });

    // -----------------------------
    // GET NEWS BY CATEGORY
    // -----------------------------
    router.get("/by-category/:category", async (req, res) => {
        try {
            const newsList = await News.find({ category: req.params.category }).sort({ publishedAt: -1 });
            res.json({ category: req.params.category, total: newsList.length, news: newsList });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });

    // -----------------------------
    // GET SINGLE NEWS BY ID
    // -----------------------------
    router.get("/:id", async (req, res) => {
        try {
            const news = await News.findById(req.params.id);
            if (!news) return res.status(404).json({ message: "News not found" });
            res.json(news);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });

    // -----------------------------
    // ADD COMMENT
    // -----------------------------
    router.post("/:id/comments", async (req, res) => {
        try {
            const { commenterName, commenterEmail, content } = req.body;
            const news = await News.findById(req.params.id);
            if (!news) return res.status(404).json({ message: "News not found" });

            news.comments.push({ commenterName, commenterEmail, content, replies: [] });
            await news.save();

            res.json({ message: "Comment added", comments: news.comments });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });

    // -----------------------------
    // ADD REPLY TO COMMENT
    // -----------------------------
    router.post("/:id/comments/:commentId/replies", async (req, res) => {
        try {
            const { replierName, replierEmail, content } = req.body;
            const news = await News.findById(req.params.id);
            if (!news) return res.status(404).json({ message: "News not found" });

            const comment = news.comments.id(req.params.commentId);
            if (!comment) return res.status(404).json({ message: "Comment not found" });

            comment.replies.push({ replierName, replierEmail, content });
            await news.save();

            res.json({ message: "Reply added", replies: comment.replies });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });

    // -----------------------------
    // GET COMMENTS
    // -----------------------------
    router.get("/:id/comments", async (req, res) => {
        try {
            const news = await News.findById(req.params.id);
            if (!news) return res.status(404).json({ message: "News not found" });
            res.json({ totalComments: news.comments.length, comments: news.comments });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });

    return router;
};
