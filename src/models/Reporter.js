import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ✅ Reporter Schema
const ReporterSchema = new mongoose.Schema({
  reporterId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["reporter"], default: "reporter" },
  profilePic: { type: String, default: "" }, // optional
  createdAt: { type: Date, default: Date.now },
});

// 🔹 Pre-save hook to hash password
ReporterSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || 10);
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// 🔹 Method to compare password during login
ReporterSchema.methods.comparePassword = async function(plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

// 🔹 Export function to inject connection (multi-DB ready)
export const ReporterModel = (connection) => {
  if (!connection) throw new Error("Reporter DB connection is required");
  return connection.model("Reporter", ReporterSchema);
};
