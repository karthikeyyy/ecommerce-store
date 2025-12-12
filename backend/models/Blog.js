import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    summary: { type: String },
    content: { type: String, required: true },
    status: { type: String, enum: ["Draft", "Published"], default: "Draft" },
    featuredImage: { type: String },
    category: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    author: { type: String, default: "Admin" },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

blogSchema.index({ slug: 1 }, { unique: true });

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
