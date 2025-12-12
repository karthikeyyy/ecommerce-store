import express from "express";
import User from "../models/User.js";
import Role from "../models/Role.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { auth } from "../middleware/auth.js";
import bcrypt from "bcrypt";

const router = express.Router();

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ------------------------ REGISTER ------------------------
router.post("/register", async (req, res) => {
  try {
    let { name, email, password, roleName, role } = req.body;

    console.log("REQUEST BODY:", req.body);

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    let finalRoleName = null;

    // CASE 1: frontend sends roleName
    if (roleName && typeof roleName === "string") {
      finalRoleName = roleName.trim().toLowerCase();
    }

    // CASE 2: frontend sends role objectId
    else if (role && mongoose.Types.ObjectId.isValid(role)) {
      const foundRole = await Role.findById(role);
      if (foundRole) {
        finalRoleName = foundRole.name;
      }
    }

    // Default if nothing matched
    if (!finalRoleName) {
      finalRoleName = "customer";
    }

    // Fetch role document
    const roleDoc = await Role.findOne({ name: finalRoleName });
    if (!roleDoc) {
      return res.status(400).json({ success: false, message: `Invalid role: ${finalRoleName}` });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: roleDoc._id,
    });

    const token = createToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: roleDoc.name,
        permissions: roleDoc.permissions,
      },
    });

  } catch (err) {
    console.log("REGISTER ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ------------------------ LOGIN ------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate("role");
    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        permissions: user.role.permissions,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ------------------------ AUTH / ME (IMPORTANT) ------------------------
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("role");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        permissions: user.role.permissions,
      },
    });
  } catch (err) {
    console.log("ME ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ------------------------ UPDATE PROFILE ------------------------
router.put("/update-profile", auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // If email is being changed, check if it's already taken
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: "Email already in use" });
      }
      user.email = email;
    }

    if (name) user.name = name;

    await user.save();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // Assuming role is populated or we need to re-populate
      },
    });
  } catch (err) {
    console.log("UPDATE PROFILE ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ------------------------ UPDATE PASSWORD ------------------------
router.put("/update-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect current password" });
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    return res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.log("UPDATE PASSWORD ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ------------------------ LOGOUT ------------------------
router.post("/logout", (req, res) => {
  return res.json({ success: true, message: "Logged out" });
});

export default router;
