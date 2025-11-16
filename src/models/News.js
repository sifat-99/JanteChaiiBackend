import mongoose from "mongoose";

// Reply Schema
const ReplySchema = new mongoose.Schema({
  replierName: { type: String, required: true },
  replierEmail: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Comment Schema
const CommentSchema = new mongoose.Schema({
  commenterName: { type: String, required: true },
  commenterEmail: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  replies: { type: [ReplySchema], default: [] } // nested replies
});

// News Schema
const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  pictureUrl: { type: String, default: "" },
  category: { type: String, default: "General" },
  reporterEmail: { type: String, required: true },
  publishedAt: { type: Date, default: Date.now },
  comments: { type: [CommentSchema], default: [] } // embedded comments
});

// Optional: Index for faster search
NewsSchema.index({ reporterEmail: 1, publishedAt: -1 });
NewsSchema.index({ category: 1, publishedAt: -1 });

export const NewsModel = (connection) => {
  if (!connection) throw new Error("News DB connection is required");
  return connection.model("News", NewsSchema);
};
