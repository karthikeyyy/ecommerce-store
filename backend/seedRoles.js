import dotenv from "dotenv";
import mongoose from "mongoose";
import Role from "./models/Role.js";

dotenv.config();

const seedRoles = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const roles = [
    {
      name: "super-admin",
      permissions: ["*", "role:create", "role:read", "role:update", "role:delete"],
    },
    {
      name: "admin",
      permissions: [
        "user:read",
        "user:update",
        "product:create",
        "product:update",
        "product:delete",
      ],
    },
    {
      name: "editor",
      permissions: ["product:create", "product:update"],
    },
    {
      name: "customer",
      permissions: [],
    },
  ];

  for (const r of roles) {
    const exists = await Role.findOne({ name: r.name });
    if (!exists) {
      await Role.create(r);
    }
  }

  console.log("Roles seeded successfully");

  await mongoose.disconnect();
};

seedRoles();
