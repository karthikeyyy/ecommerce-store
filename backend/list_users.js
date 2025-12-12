import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    const users = await User.find({});
    console.log(users);
    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
