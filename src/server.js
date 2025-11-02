// src/server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import path from "path";
import cors from "cors";
import morgan from "morgan";

import { adminRouter } from "./routes/adminRoutes.js";
import { userRouter } from "./routes/userRoutes.js";
import { reporterRouter } from "./routes/reporterRoutes.js";

import { notFound, errorHandler } from "./middlewares/error.js";

const PORT = process.env.PORT || 5000;
const app = express();

// -----------------------------
// Global Middlewares
// -----------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// -----------------------------
// Test Route
// -----------------------------
app.get("/", (req, res) => {
  res.send("✅ Multi-DB API server is running successfully!");
});

// -----------------------------
// Connect multiple databases
// -----------------------------
const connectDB = async () => {
  try {
    const userConn = mongoose.createConnection(
      `${process.env.MONGO_URI}/${process.env.DB_USER_NAME}`
    );
    userConn.on("connected", () =>
      console.log(`✅ Users DB connected: ${process.env.DB_USER_NAME}`)
    );

    const reporterConn = mongoose.createConnection(
      `${process.env.MONGO_URI}/${process.env.DB_REPORTER_NAME}`
    );
    reporterConn.on("connected", () =>
      console.log(`✅ Reporters DB connected: ${process.env.DB_REPORTER_NAME}`)
    );

    const adminConn = mongoose.createConnection(
      `${process.env.MONGO_URI}/${process.env.DB_ADMIN_NAME}`
    );
    adminConn.on("connected", () =>
      console.log(`✅ Admins DB connected: ${process.env.DB_ADMIN_NAME}`)
    );

    // Routes
    app.use("/api/users", userRouter(userConn));
    app.use("/api/reporters", reporterRouter(reporterConn));
    app.use("/api/admins", adminRouter(adminConn));

    // Error handlers
    app.use(notFound);
    app.use(errorHandler);

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }
};

connectDB();
