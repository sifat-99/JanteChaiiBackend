// src/config/db.js
import mongoose from "mongoose";

// 🌟 Connections holder
let userConn;
let reporterConn;
let adminConn;

/**
 * Connect to all databases (User, Reporter, Admin)
 */
export const connectDB = async () => {
  try {
    // ✅ User Database
    userConn = await mongoose.createConnection(
      `${process.env.MONGO_URI}/${process.env.DB_USER_NAME}`,
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    console.log("✅ User DB connected");

    // ✅ Reporter Database
    reporterConn = await mongoose.createConnection(
      `${process.env.MONGO_URI}/${process.env.DB_REPORTER_NAME}`,
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    console.log("✅ Reporter DB connected");

    // ✅ Admin Database
    adminConn = await mongoose.createConnection(
      `${process.env.MONGO_URI}/${process.env.DB_ADMIN_NAME}`,
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    console.log("✅ Admin DB connected");

    return { userConn, reporterConn, adminConn };
  } catch (err) {
    console.error("❌ DB connection failed:", err);
    throw err;
  }
};

/**
 * Getters for models/routes
 */
export const getUserConn = () => {
  if (!userConn) throw new Error("User DB not connected yet");
  return userConn;
};

export const getReporterConn = () => {
  if (!reporterConn) throw new Error("Reporter DB not connected yet");
  return reporterConn;
};

export const getAdminConn = () => {
  if (!adminConn) throw new Error("Admin DB not connected yet");
  return adminConn;
};
