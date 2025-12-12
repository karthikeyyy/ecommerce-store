import express from "express";
import Role from "../models/Role.js";
import { auth } from "../middleware/auth.js";
import { allowPermissions } from "../middleware/checkPermission.js";

const router = express.Router();

router.post(
  "/",
  auth,
  allowPermissions("role:create", "*"),
  async (req, res) => {
    try {
      const { name, permissions } = req.body;

      const existing = await Role.findOne({ name });
      if (existing) {
        return res.status(400).json({ message: "Role already exists" });
      }

      const role = await Role.create({ name, permissions });
      res.status(201).json(role);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.get("/", auth, async (req, res) => {
  try {
    const roles = await Role.find();

    res.json({
      success: true,
      roles: roles.map((r) => ({
        _id: r._id,
        name: r.name
      })),
    });

  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put(
  "/:id",
  auth,
  allowPermissions("role:update", "*"),
  async (req, res) => {
    try {
      const { name, permissions } = req.body;
      const role = await Role.findByIdAndUpdate(
        req.params.id,
        { name, permissions },
        { new: true }
      );
      res.json(role);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.delete(
  "/:id",
  auth,
  allowPermissions("role:delete", "*"),
  async (req, res) => {
    try {
      await Role.findByIdAndDelete(req.params.id);
      res.json({ message: "Role deleted" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
