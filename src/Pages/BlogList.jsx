import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Layout/Header";
import Footer from "../Components/Layout/Footer";
import { FileText, PlusCircle, Pencil, Trash2 } from "lucide-react";

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:4000/api/blogs");
      const data = await res.json();
      if (data.success && Array.isArray(data.blogs)) {
        setBlogs(data.blogs);
      } else if (Array.isArray(data)) {
        setBlogs(data);
      } else {
        setBlogs([]);
      }
    } catch (err) {
      console.error("Failed to fetch blogs", err);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this blog post?");
    if (!ok) return;
    try {
      setDeletingId(id);
      const res = await fetch(`http://localhost:4000/api/blogs/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || "Failed to delete blog");
        return;
      }
      setBlogs((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete blog");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Header />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
                  <FileText className="w-7 h-7 text-emerald-500" />
                  Blog
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  Manage your blog posts, publish updates, and edit content.
                </p>
              </div>
              <button
                onClick={() => navigate("/blog/new")}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-400"
              >
                <PlusCircle className="w-4 h-4" />
                New post
              </button>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:backdrop-blur">
              <div className="flex items-center justify-between px-4 py-3 md:px-6 border-b border-gray-100 dark:border-slate-800">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-slate-400">
                  Blog posts
                </p>
                <span className="text-xs text-gray-400 dark:text-slate-500">
                  {blogs.length} total
                </span>
              </div>

              {loading ? (
                <div className="p-6 text-sm text-gray-500 dark:text-slate-400">
                  Loading blogs...
                </div>
              ) : blogs.length === 0 ? (
                <div className="p-6 text-sm text-gray-500 dark:text-slate-400">
                  No blog posts found. Start by creating one.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-slate-900/80">
                      <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">
                        <th className="px-4 py-3 md:px-6">Title</th>
                        <th className="px-4 py-3 md:px-6">Category</th>
                        <th className="px-4 py-3 md:px-6">Tags</th>
                        <th className="px-4 py-3 md:px-6">Status</th>
                        <th className="px-4 py-3 md:px-6">Author</th>
                        <th className="px-4 py-3 md:px-6">Published</th>
                        <th className="px-4 py-3 md:px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                      {blogs.map((blog) => (
                        <tr
                          key={blog._id}
                          className="hover:bg-gray-50 dark:hover:bg-slate-900/60"
                        >
                          <td className="px-4 py-3 md:px-6">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900 dark:text-slate-100 line-clamp-1">
                                {blog.title}
                              </span>
                              <span className="text-xs text-gray-400 dark:text-slate-500 line-clamp-1">
                                {blog.subtitle || blog.slug}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 md:px-6">
                            <span className="text-sm text-gray-600 dark:text-slate-300">
                              {blog.category || "-"}
                            </span>
                          </td>
                          <td className="px-4 py-3 md:px-6">
                            <div className="flex flex-wrap gap-1">
                              {Array.isArray(blog.tags) && blog.tags.length > 0
                                ? blog.tags.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-400/30"
                                  >
                                    {tag}
                                  </span>
                                ))
                                : "-"}
                            </div>
                          </td>
                          <td className="px-4 py-3 md:px-6">
                            <span
                              className={
                                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium " +
                                (blog.status === "Published"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                                  : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300")
                              }
                            >
                              {blog.status || "Draft"}
                            </span>
                          </td>
                          <td className="px-4 py-3 md:px-6">
                            <span className="text-xs text-gray-600 dark:text-slate-300">
                              {blog.author || "Admin"}
                            </span>
                          </td>
                          <td className="px-4 py-3 md:px-6">
                            <span className="text-xs text-gray-500 dark:text-slate-400">
                              {blog.publishedAt
                                ? new Date(blog.publishedAt).toLocaleDateString()
                                : "-"}
                            </span>
                          </td>
                          <td className="px-4 py-3 md:px-6">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => navigate(`/blog/${blog._id}/edit`)}
                                className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:bg-slate-800"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(blog._id)}
                                disabled={deletingId === blog._id}
                                className="inline-flex items-center justify-center rounded-lg border border-red-100 bg-red-50 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-100 disabled:opacity-60 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default BlogList;
