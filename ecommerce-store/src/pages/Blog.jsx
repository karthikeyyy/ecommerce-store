import React, { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getBlogs } from "../api/blogService";
import FilterSidebar from "../components/FilterSidebar";

function Blog() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get("search") || "";
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedType, setSelectedType] = useState("");

    useEffect(() => {
        getBlogs()
            .then((res) => {
                const data = res.data;
                let list = [];
                // Robust data handling copied from BlogSlider
                if (data?.success && Array.isArray(data.blogs)) list = data.blogs;
                else if (Array.isArray(data)) list = data;
                else if (Array.isArray(data?.data)) list = data.data;

                // Filter published
                list = list.filter((b) => !b.status || b.status === "Published");
                setBlogs(list);
            })
            .catch((err) => {
                console.error("Failed to fetch blogs", err);
                setError(err.message || "Failed to load blogs.");
            })
            .finally(() => setLoading(false));
    }, []);

    // Extract categories
    const categories = useMemo(() => {
        const cats = blogs.map(b => {
            if (typeof b.category === 'object' && b.category !== null) {
                return b.category.name; // Assuming blog category object also has a name field
            }
            return b.category;
        }).filter(Boolean);
        return [...new Set(cats)];
    }, [blogs]);

    // Extract blog types
    const types = useMemo(() => {
        const typeSet = new Set();
        blogs.forEach(b => {
            if (b.type) typeSet.add(b.type);
        });
        return Array.from(typeSet);
    }, [blogs]);

    // Filter logic
    const filteredBlogs = useMemo(() => {
        return blogs.filter((b) => {
            const matchesSearch = b.title?.toLowerCase().includes(searchQuery.toLowerCase());

            let blogCategoryName = "";
            if (typeof b.category === 'object' && b.category !== null) {
                blogCategoryName = b.category.name;
            } else {
                blogCategoryName = b.category;
            }

            const matchesCategory = selectedCategory ? blogCategoryName === selectedCategory : true;
            const matchesType = selectedType ? b.type === selectedType : true;

            return matchesSearch && matchesCategory && matchesType;
        });
    }, [blogs, searchQuery, selectedCategory, selectedType]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="text-xl font-semibold text-gray-500">Loading blogs...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="text-xl font-semibold text-red-500">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">Our Blog</h1>
                <p className="mt-2 text-gray-500">Latest news and updates from our team</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <FilterSidebar
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    types={types}
                    selectedType={selectedType}
                    onSelectType={setSelectedType}
                />

                <div className="flex-1">
                    {searchQuery && (
                        <p className="mb-4 text-sm text-gray-500">
                            Showing results for "<span className="font-semibold text-black">{searchQuery}</span>"
                        </p>
                    )}

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                        {/* Changed grid cols to accommodate sidebar width */}
                        {filteredBlogs.map((blog) => (
                            <Link
                                key={blog._id || blog.id}
                                to={`/blog/${blog._id || blog.id}`}
                                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
                            >
                                <div className="aspect-[16/9] w-full bg-gray-100 overflow-hidden">
                                    <img
                                        src={blog.featuredImage || "https://via.placeholder.com/600x400?text=No+Image"}
                                        alt={blog.title}
                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                    />
                                </div>
                                <div className="flex flex-1 flex-col p-5">
                                    <div className="mb-2">
                                        <span className="inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
                                            {blog.category || "News"}
                                        </span>
                                    </div>
                                    <h3 className="mb-2 text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600">
                                        {blog.title}
                                    </h3>
                                    <p className="mb-4 flex-1 text-sm text-gray-500 line-clamp-3">
                                        {(blog.summary || blog.content || "").replace(/<[^>]+>/g, "").substring(0, 100)}...
                                    </p>
                                    <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                                        <span className="text-xs text-gray-400">
                                            {new Date(blog.createdAt || Date.now()).toLocaleDateString()}
                                        </span>
                                        <span className="text-sm font-medium text-blue-600 group-hover:underline">
                                            Read Article &rarr;
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {filteredBlogs.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No blog posts found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Blog;
