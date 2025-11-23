import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
    categoryId: { type: String, required: true, unique: true },
    categoryName: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
});

export const CategoryModel = (connection) => {
    if (!connection) throw new Error("News DB connection is required");
    return connection.model("Category", CategorySchema);
};
