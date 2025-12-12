import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import Role from "../models/Role.js";
import { auth } from "../middleware/auth.js";
import { allowPermissions } from "../middleware/checkPermission.js";

const router = express.Router();

const rolePriority = {
  "super-admin": 3,
  admin: 2,
  editor: 1,
  customer: 0,
};

// --------------------------------------------
// CREATE USER
// --------------------------------------------
router.post("/", auth, allowPermissions("user:create"), async (req, res) => {
  try {
    let { name, email, password, roleName, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    let finalRoleName = null;

    if (roleName && typeof roleName === "string") {
      finalRoleName = roleName.toLowerCase();
    } else if (role && mongoose.Types.ObjectId.isValid(role)) {
      const foundRole = await Role.findById(role);
      if (foundRole) finalRoleName = foundRole.name;
    }

    if (!finalRoleName) finalRoleName = "customer";

    const roleDoc = await Role.findOne({ name: finalRoleName });
    if (!roleDoc) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role: roleDoc._id,
    });

    res.json({
      success: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: {
          _id: roleDoc._id,
          name: roleDoc.name,
        },
      },
    });
  } catch (err) {
    console.log("CREATE USER ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --------------------------------------------
// GET ALL USERS
// --------------------------------------------
router.get("/", auth, allowPermissions("user:read"), async (req, res) => {
  try {
    const users = await User.find().populate("role");

    res.json({
      success: true,
      users: users.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role?.name,
      })),
    });
  } catch (err) {
    console.log("GET USERS ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --------------------------------------------
// GET SINGLE USER
// --------------------------------------------
router.get("/:id", auth, allowPermissions("user:read"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("role");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: {
          _id: user.role?._id,
          name: user.role?.name,
        },
      },
    });
  } catch (err) {
    console.log("GET USER ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --------------------------------------------
// UPDATE USER (supports password update)
// --------------------------------------------
router.put("/:id", auth, allowPermissions("user:update"), async (req, res) => {
  try {
    const actingUser = await User.findById(req.user.id).populate("role");
    const targetUser = await User.findById(req.params.id).populate("role");

    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const actingPower = rolePriority[actingUser.role.name];
    const targetPower = rolePriority[targetUser.role.name];

    if (actingPower <= targetPower) {
      return res.status(403).json({ success: false, message: "You cannot modify this user" });
    }

    // Build update object
    let updateData = {
      name: req.body.name,
      email: req.body.email,
    };

    // SUPPORT PASSWORD CHANGE
    if (req.body.password && req.body.password.trim().length > 0) {
      updateData.password = req.body.password;
    }

    // SUPPORT ROLE UPDATE
    if (req.body.role && mongoose.Types.ObjectId.isValid(req.body.role)) {
      updateData.role = req.body.role;
    } else if (req.body.role) {
      const roleDoc = await Role.findOne({ name: req.body.role.toLowerCase() });
      if (roleDoc) updateData.role = roleDoc._id;
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).populate("role");

    res.json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: {
          _id: updatedUser.role?._id,
          name: updatedUser.role?.name,
        },
      },
    });
  } catch (err) {
    console.log("UPDATE USER ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --------------------------------------------
// DELETE USER
// --------------------------------------------
router.delete("/:id", auth, allowPermissions("user:delete"), async (req, res) => {
  try {
    const actingUser = await User.findById(req.user.id).populate("role");
    const targetUser = await User.findById(req.params.id).populate("role");

    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const actingPower = rolePriority[actingUser.role.name];
    const targetPower = rolePriority[targetUser.role.name];

    if (actingPower <= targetPower) {
      return res.status(403).json({ success: false, message: "You cannot delete this user" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.log("DELETE USER ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
