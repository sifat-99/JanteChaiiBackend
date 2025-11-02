// src/app.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";

import { notFound, errorHandler } from "./middlewares/error.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ✅ Serve uploads folder as static
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// Error middlewares (will handle errors from routes later)
app.use(notFound);
app.use(errorHandler);

export default app;
