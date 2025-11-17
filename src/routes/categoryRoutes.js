// src/routes/categoryRoutes.js
import express from "express";
import { CategoryModel } from "../models/Category.js";

export const categoryRouter = (connection) => {
    if (!connection) throw new Error("News DB connection is required");
    const Category = CategoryModel(connection);
    const router = express.Router();

    // -----------------------------
    // CREATE CATEGORY
    // -----------------------------
    router.post("/", async (req, res) => {
        try {
            const { categoryName } = req.body;
            const existing = await Category.findOne({ categoryName });
            if (existing)
                return res.status(400).json({ message: "Category already exists" });

            const categoryId = "CAT" + Date.now();
            const newCategory = await Category.create({ categoryId, categoryName });

            res
                .status(201)
                .json({ message: "Category created successfully", category: newCategory });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });

    // -----------------------------
    // GET ALL CATEGORIES
    // -----------------------------
    router.get("/", async (req, res) => {
        try {
            const categories = await Category.find({});
            res.json(categories);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });

    // -----------------------------
    // GET SINGLE CATEGORY
    // -----------------------------
    router.get("/:id", async (req, res) => {
        try {
            const category = await Category.findById(req.params.id);
            if (!category) return res.status(404).json({ message: "Category not found" });
            res.json(category);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });

    // -----------------------------
    // UPDATE CATEGORY
    // -----------------------------
    router.put("/:id", async (req, res) => {
        try {
            const { categoryName } = req.body;
            const updatedCategory = await Category.findByIdAndUpdate(
                req.params.id,
                { categoryName },
                { new: true }
            );

            if (!updatedCategory)
                return res.status(404).json({ message: "Category not found" });

            res.json({ message: "Category updated successfully", category: updatedCategory });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });

    // -----------------------------
    // DELETE CATEGORY
    // -----------------------------
    router.delete("/:id", async (req, res) => {
        try {
            const deletedCategory = await Category.findByIdAndDelete(req.params.id);
            if (!deletedCategory)
                return res.status(404).json({ message: "Category not found" });

            res.json({ message: "Category deleted successfully" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    });

    return router;
};
