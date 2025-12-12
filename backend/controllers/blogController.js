import Blog from "../models/Blog.js";

const slugify = (value) => {
  return value
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

export const createBlog = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      slug,
      summary,
      content,
      status,
      featuredImage,
      category,
      tags,
    } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ success: false, message: "Title and content are required" });
    }

    let finalSlug = slug && slug.trim() ? slugify(slug) : slugify(title);

    const existing = await Blog.findOne({ slug: finalSlug });
    if (existing) {
      finalSlug = `${finalSlug}-${Date.now().toString(36)}`;
    }

    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
      ? tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const blog = await Blog.create({
      title,
      subtitle,
      slug: finalSlug,
      summary,
      content,
      status: status || "Draft",
      featuredImage,
      category: category || "",
      tags: parsedTags,
      author: req.user?.name || "Admin",
      publishedAt: status === "Published" ? new Date() : null,
    });

    return res.status(201).json({ success: true, blog });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Slug already exists" });
    }
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    return res.json({ success: true, blogs });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }
    return res.json({ success: true, blog });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      slug,
      summary,
      content,
      status,
      featuredImage,
      category,
      tags,
    } = req.body;

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    let finalSlug = blog.slug;
    if (slug && slug.trim()) {
      finalSlug = slugify(slug);
      const existing = await Blog.findOne({
        slug: finalSlug,
        _id: { $ne: blog._id },
      });
      if (existing) {
        finalSlug = `${finalSlug}-${Date.now().toString(36)}`;
      }
    } else if (title && title !== blog.title) {
      finalSlug = slugify(title);
    }

    blog.title = title ?? blog.title;
    blog.subtitle = subtitle ?? blog.subtitle;
    blog.slug = finalSlug;
    blog.summary = summary ?? blog.summary;
    blog.content = content ?? blog.content;
    blog.featuredImage = featuredImage ?? blog.featuredImage;
    blog.status = status ?? blog.status;
    blog.category = category ?? blog.category;
    blog.tags = Array.isArray(tags) ? tags : blog.tags;

    if (blog.status === "Published" && !blog.publishedAt) {
      blog.publishedAt = new Date();
    }
    if (blog.status === "Draft") {
      blog.publishedAt = null;
    }

    await blog.save();

    return res.json({ success: true, blog });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Slug already exists" });
    }
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }
    return res.json({ success: true, message: "Blog deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
