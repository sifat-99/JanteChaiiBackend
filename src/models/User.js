import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ✅ User Schema
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user"], default: "user" },
    profilePic: {
        type: String,
        default: "", // Optional: খালি string রাখলে কোনো picture না থাকলেও সমস্যা হবে না
    },
    createdAt: { type: Date, default: Date.now },
});

// 🔹 Pre-save hook to hash password
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || 10);
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
});

// 🔹 Method to compare password during login
UserSchema.methods.comparePassword = async function (plainPassword) {
    return await bcrypt.compare(plainPassword, this.password);
};

// 🔹 Export function to inject connection (multi-DB ready)
export const UserModel = (connection) => {
    if (!connection) throw new Error("User DB connection is required");
    return connection.model("User", UserSchema);
};
