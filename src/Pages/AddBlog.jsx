import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Layout/Header";
import Footer from "../Components/Layout/Footer";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { ImagePlus, FileText, Save } from "lucide-react";

const AddBlog = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    title: "",
    subtitle: "",
    slug: "",
    summary: "",
    content: "",
    status: "Draft",
    featuredImage: "",
    category: "",
    tags: [],
  });

  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [metaLoading, setMetaLoading] = useState(true);

  const convertToBase64 = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await convertToBase64(file);
    setData((prev) => ({ ...prev, featuredImage: base64 }));
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setData((prev) => ({
      ...prev,
      [field]: value,
      slug:
        field === "title" && !prev.slug
          ? value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "")
          : prev.slug,
    }));
  };

  const toggleTag = (name) => {
    setData((prev) => {
      const current = Array.isArray(prev.tags) ? prev.tags : [];
      const exists = current.includes(name);
      return {
        ...prev,
        tags: exists ? current.filter((t) => t !== name) : [...current, name],
      };
    });
  };

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const [catRes, tagRes] = await Promise.all([
          fetch("http://localhost:4000/api/blog-categories", { headers }),
          fetch("http://localhost:4000/api/blog-tags", { headers }),
        ]);

        const catJson = await catRes.json();
        const tagJson = await tagRes.json();

        const extractList = (json, keyGuess) => {
          if (Array.isArray(json)) return json;
          if (Array.isArray(json.data)) return json.data;
          if (keyGuess && Array.isArray(json[keyGuess])) return json[keyGuess];
          return [];
        };

        const catList = extractList(catJson, "categories").filter(
          (c) => c.isActive === undefined || c.isActive
        );
        const tagList = extractList(tagJson, "tags").filter(
          (t) => t.isActive === undefined || t.isActive
        );

        setCategories(catList);
        setAllTags(tagList);
      } catch (err) {
        console.error("Failed to load categories/tags", err);
      } finally {
        setMetaLoading(false);
      }
    };

    loadMeta();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.title.trim()) {
      alert("Title is required");
      return;
    }
    if (!data.content.trim()) {
      alert("Content is required");
      return;
    }

    setSaving(true);
    try {
      const body = {
        ...data,
        tags: Array.isArray(data.tags)
          ? data.tags.filter(Boolean)
          : [],
        category: data.category || "",
      };

      const res = await fetch("http://localhost:4000/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.message || "Failed to create blog");
        setSaving(false);
        return;
      }
      navigate("/blog");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setSaving(false);
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
                  New blog post
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  Write and publish a new article for your blog.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/blog")}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-800 text-sm font-medium bg-white hover:bg-gray-100 dark:border-slate-600 dark:text-slate-100 dark:bg-transparent dark:hover:bg-slate-800"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="add-blog-form"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-400 disabled:opacity-60"
                  disabled={saving}
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Publishing..." : "Publish post"}
                </button>
              </div>
            </div>

            <form
              id="add-blog-form"
              onSubmit={handleSubmit}
              className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1.1fr)]"
            >
              <div className="space-y-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 space-y-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-500 dark:text-emerald-400">
                        Content
                      </p>
                      <h2 className="mt-1 text-lg font-semibold">
                        Article details
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Title</Label>
                    <input
                      type="text"
                      value={data.title}
                      onChange={handleChange("title")}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
                      placeholder="Write a clear, engaging title"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Subtitle</Label>
                    <input
                      type="text"
                      value={data.subtitle}
                      onChange={handleChange("subtitle")}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
                      placeholder="Optional short subtitle"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Slug</Label>
                    <input
                      type="text"
                      value={data.slug}
                      onChange={handleChange("slug")}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
                      placeholder="post-url-slug"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Summary</Label>
                    <div className="rounded-xl border border-gray-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950/60">
                      <CKEditor
                        editor={ClassicEditor}
                        data={data.summary}
                        onChange={(event, editor) =>
                          setData((prev) => ({
                            ...prev,
                            summary: editor.getData(),
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Main content</Label>
                    <div className="rounded-xl border border-gray-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950/60">
                      <CKEditor
                        editor={ClassicEditor}
                        data={data.content}
                        onChange={(event, editor) =>
                          setData((prev) => ({
                            ...prev,
                            content: editor.getData(),
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 space-y-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:backdrop-blur">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-500 dark:text-emerald-400">
                      Media
                    </p>
                    <h2 className="mt-1 text-lg font-semibold">
                      Featured image
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {data.featuredImage ? (
                      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-slate-800 dark:bg-slate-950/60">
                        <img
                          src={data.featuredImage}
                          alt="Featured"
                          className="h-56 w-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition hover:opacity-100">
                          <label className="cursor-pointer rounded-full bg-white px-4 py-2 text-xs font-semibold text-gray-900 shadow">
                            Change image
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label className="flex h-56 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-gray-500 transition hover:border-emerald-500 hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:border-emerald-500 dark:hover:bg-slate-900/70">
                        <ImagePlus className="mb-2 h-8 w-8" />
                        <span className="text-xs font-medium">
                          Click to upload featured image
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 space-y-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:backdrop-blur">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-500 dark:text-emerald-400">
                      Meta
                    </p>
                    <h2 className="mt-1 text-lg font-semibold">
                      Visibility and tags
                    </h2>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <select
                      value={data.status}
                      onChange={handleChange("status")}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <select
                      value={data.category}
                      onChange={handleChange("category")}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
                      disabled={metaLoading}
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option
                          key={cat._id || cat.name}
                          value={cat.name}
                        >
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Tags</Label>
                    {metaLoading ? (
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        Loading tags...
                      </p>
                    ) : allTags.length === 0 ? (
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        No tags found. Create tags in Blog Tags page.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {allTags.map((tag) => {
                          const name = tag.name;
                          if (!name) return null;
                          const active =
                            Array.isArray(data.tags) &&
                            data.tags.includes(name);
                          return (
                            <button
                              key={tag._id || name}
                              type="button"
                              onClick={() => toggleTag(name)}
                              className={
                                "px-3 py-1.5 rounded-full text-xs font-medium border transition " +
                                (active
                                  ? "bg-emerald-500 text-white border-emerald-500"
                                  : "bg-gray-50 text-gray-700 border-gray-300 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700")
                              }
                            >
                              {name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

const Label = ({ children }) => (
  <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">
    {children}
  </p>
);

export default AddBlog;
