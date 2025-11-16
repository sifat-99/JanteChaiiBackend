import mongoose from "mongoose";

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  pictureUrl: { type: String, default: "" },
  category: { type: String, default: "General" },
  reporterEmail: { type: String, required: true }, // Reporter email auto attach
  publishedAt: { type: Date, default: Date.now },
});

// Optional: Index for faster search by reporter
NewsSchema.index({ reporterEmail: 1, publishedAt: -1 });

export const NewsModel = (connection) => {
  if (!connection) throw new Error("News DB connection is required");
  return connection.model("News", NewsSchema);
};
