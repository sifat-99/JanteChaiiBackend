import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ✅ Admin Schema
const AdminSchema = new mongoose.Schema({
    adminId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin"], default: "admin" }, // auto role
    profilePic: {
        type: String,
        default: "", // optional, যদি picture না থাকে
    },
    createdAt: { type: Date, default: Date.now },
});

// 🔹 Pre-save hook to hash password (optional if you want auto hash)
AdminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || 10);
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
});

// 🔹 Method to compare password during login
AdminSchema.methods.comparePassword = async function (plainPassword) {
    return await bcrypt.compare(plainPassword, this.password);
};

// 🔹 Export function to accept a connection (multi-DB ready)
export const AdminModel = (connection) => {
    if (!connection) throw new Error("Admin DB connection is required");
    return connection.model("Admin", AdminSchema);
};
