import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Role from "./models/Role.js";
import bcrypt from "bcryptjs";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    // Find or create admin role
    let adminRole = await Role.findOne({ name: "Admin" });
    if (!adminRole) {
        adminRole = await Role.create({ name: "Admin", permissions: ["all"] });
    }

    const user = new User({
      name: "Admin Test 2",
      email: "admin_test2@example.com",
      password: "password123",
      role: adminRole._id,
    });

    await user.save();
    console.log("User created");
    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
