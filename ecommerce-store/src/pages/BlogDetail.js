import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getBlogById } from "../api/blogService";

function BlogDetail() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBlog() {
      try {
        setLoading(true);
        setError("");
        const res = await getBlogById(id);
        const data = res.data;
        const b = data?.blog || data?.data || data || null;
        setBlog(b);
      } catch (err) {
        setError("Failed to load blog");
      } finally {
        setLoading(false);
      }
    }
    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        Loading blog...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500 font-medium">
        {error}
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="p-6 text-center text-gray-600">
        Blog not found.
      </div>
    );
  }

  const categoryLabels = [];
  if (blog.category) {
    if (typeof blog.category === "string") {
      categoryLabels.push(blog.category);
    } else if (blog.category.name) {
      categoryLabels.push(blog.category.name);
    }
  }
  if (Array.isArray(blog.categories)) {
    blog.categories.forEach((c) => {
      if (typeof c === "string") categoryLabels.push(c);
      else if (c.name) categoryLabels.push(c.name);
    });
  }

  const tags = Array.isArray(blog.tags) ? blog.tags : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        to="/"
        className="mb-4 inline-flex text-xs font-medium text-gray-500 hover:text-gray-900"
      >
        ← Back to home
      </Link>

      <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-gray-500">
        {categoryLabels.map((cat, idx) => (
          <span
            key={idx}
            className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-medium text-gray-700"
          >
            {cat}
          </span>
        ))}
        {blog.createdAt && (
          <span className="text-[10px] text-gray-400">
            {new Date(blog.createdAt).toLocaleDateString()}
          </span>
        )}
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
        {blog.title}
      </h1>

      {blog.featuredImage && (
        <div className="mt-6 overflow-hidden rounded-3xl bg-gray-100">
          <img
            src={blog.featuredImage}
            alt={blog.title}
            className="max-h-[420px] w-full object-cover"
          />
        </div>
      )}

      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6 text-sm leading-relaxed text-gray-700">
        {blog.content ? (
          <div
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        ) : (
          <p>{blog.summary || ""}</p>
        )}
      </div>
    </div>
  );
}

export default BlogDetail;
