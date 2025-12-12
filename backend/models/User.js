import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },

    email: { 
      type: String, 
      unique: true, 
      required: true 
    },

    password: { 
      type: String, 
      required: true 
    },

    cartItems: [
      {
        quantity: { 
          type: Number, 
          default: 1 
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        selectedAttributes: [
          {
            name: { type: String, required: true },
            value: { type: String, required: true },
          }
        ],
      },
    ],

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
