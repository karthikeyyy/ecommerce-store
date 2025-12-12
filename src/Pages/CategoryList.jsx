import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Layout/Header";
import Footer from "../Components/Layout/Footer";
import { apiRequest } from "../api/api";
import {
    Search, Plus, X, Edit2, Trash2, Grid3x3, List,
    Image as ImageIcon, Palette, FolderTree, CheckSquare,
    Square, TrendingUp, DollarSign, Package, AlertCircle
} from "lucide-react";

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        icon: "",
        color: "#10b981",
        parent: "",
        isActive: true
    });
    const [viewMode, setViewMode] = useState("table"); // "table" or "grid"
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [iconPreview, setIconPreview] = useState("");

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await apiRequest("/categories");
            setCategories(response.data || []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching categories:", error);
            setCategories([]);
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filter categories based on search term
    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (category = null) => {
        if (category) {
            setCurrentCategory(category);
            setFormData({
                name: category.name,
                description: category.description,
                icon: category.icon || "",
                color: category.color || "#10b981",
                parent: category.parent || "",
                isActive: category.isActive !== undefined ? category.isActive : true
            });
            setIconPreview(category.icon || "");
        } else {
            setCurrentCategory(null);
            setFormData({
                name: "",
                description: "",
                icon: "",
                color: "#10b981",
                parent: "",
                isActive: true
            });
            setIconPreview("");
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentCategory(null);
        setFormData({
            name: "",
            description: "",
            icon: "",
            color: "#10b981",
            parent: "",
            isActive: true
        });
        setIconPreview("");
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setFormData({ ...formData, icon: base64String });
                setIconPreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentCategory) {
                await apiRequest(`/categories/${currentCategory._id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });
            } else {
                await apiRequest("/categories", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });
            }
            fetchCategories();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving category:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this category? All child categories will also be deleted.")) {
            try {
                const response = await apiRequest(`/categories/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (response.success) {
                    fetchCategories();
                    setSelectedCategories(selectedCategories.filter(catId => catId !== id));
                } else {
                    alert(response.message || "Failed to delete category");
                }
            } catch (error) {
                console.error("Error deleting category:", error);
                alert("An error occurred while deleting the category");
            }
        }
    };

    const handleSelectCategory = (id) => {
        if (selectedCategories.includes(id)) {
            setSelectedCategories(selectedCategories.filter(catId => catId !== id));
        } else {
            setSelectedCategories([...selectedCategories, id]);
        }
    };

    const handleSelectAll = () => {
        if (selectedCategories.length === filteredCategories.length) {
            setSelectedCategories([]);
        } else {
            setSelectedCategories(filteredCategories.map(cat => cat._id));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedCategories.length === 0) return;

        if (window.confirm(`Are you sure you want to delete ${selectedCategories.length} categories?`)) {
            try {
                await apiRequest("/categories/bulk-delete", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ ids: selectedCategories }),
                });
                fetchCategories();
                setSelectedCategories([]);
            } catch (error) {
                console.error("Error bulk deleting categories:", error);
            }
        }
    };

    const handleBulkUpdateStatus = async (isActive) => {
        if (selectedCategories.length === 0) return;

        try {
            await apiRequest("/categories/bulk-status", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ids: selectedCategories, isActive }),
            });
            fetchCategories();
            setSelectedCategories([]);
        } catch (error) {
            console.error("Error updating category status:", error);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount || 0);
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await apiRequest(`/categories/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ isActive: !currentStatus }),
            });
            fetchCategories();
        } catch (error) {
            console.error("Error toggling category status:", error);
        }
    };

    const CategoryCard = ({ category }) => (
        <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200 dark:border-gray-700"
            style={{ borderTopColor: category.color, borderTopWidth: '4px' }}
        >
            <div className="p-6">
                {/* Selection Checkbox */}
                <div className="flex items-start justify-between mb-4">
                    <button
                        onClick={() => handleSelectCategory(category._id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        {selectedCategories.includes(category._id) ? (
                            <CheckSquare className="w-5 h-5 text-green-600" />
                        ) : (
                            <Square className="w-5 h-5" />
                        )}
                    </button>
                    {!category.isActive && (
                        <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                            Inactive
                        </span>
                    )}
                </div>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    {category.icon ? (
                        <img
                            src={category.icon}
                            alt={category.name}
                            className="w-20 h-20 object-cover rounded-lg"
                        />
                    ) : (
                        <div
                            className="w-20 h-20 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: category.color + '20' }}
                        >
                            <Package className="w-10 h-10" style={{ color: category.color }} />
                        </div>
                    )}
                </div>

                {/* Category Name */}
                <h3 className="text-lg font-bold text-center mb-2 text-gray-800 dark:text-white">
                    {category.name}
                </h3>

                {/* Description */}
                {category.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4 line-clamp-2">
                        {category.description}
                    </p>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Package className="w-4 h-4 text-blue-500" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">Products</span>
                        </div>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">{category.count || 0}</p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">Revenue</span>
                        </div>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">
                            {formatCurrency(category.totalRevenue)}
                        </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-purple-500" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">Avg Price</span>
                        </div>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">
                            {formatCurrency(category.avgPrice)}
                        </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">Stock</span>
                        </div>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">
                            {category.inStockCount || 0}/{(category.inStockCount || 0) + (category.outOfStockCount || 0)}
                        </p>
                    </div>
                </div>

                {/* Children Badge */}
                {category.childrenCount > 0 && (
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <FolderTree className="w-4 h-4 text-gray-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {category.childrenCount} subcategories
                        </span>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={() => handleOpenModal(category)}
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center justify-center gap-2"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit
                    </button>
                    <button
                        onClick={() => handleDelete(category._id)}
                        className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center justify-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <React.Fragment>
            <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100">
                <Sidebar />
                <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                    <Header />
                    <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
                        <div className="max-w-7xl mx-auto space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-semibold tracking-tight">Categories</h1>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Manage product categories</p>
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <div className="relative flex-1 md:w-64">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            placeholder="Search categories..."
                                            value={searchTerm}
                                            onChange={handleSearch}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl bg-white dark:bg-slate-900/60 dark:border-slate-700 text-sm focus:outline-none focus:border-emerald-500 transition"
                                        />
                                    </div>

                                    {/* View Toggle */}
                                    <div className="flex bg-white dark:bg-slate-900/60 rounded-xl border border-gray-300 dark:border-slate-700">
                                        <button
                                            onClick={() => setViewMode("table")}
                                            className={`p-2 rounded-l-xl transition ${viewMode === "table"
                                                ? "bg-emerald-500 text-white"
                                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                                                }`}
                                            title="Table View"
                                        >
                                            <List className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode("grid")}
                                            className={`p-2 rounded-r-xl transition ${viewMode === "grid"
                                                ? "bg-emerald-500 text-white"
                                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                                                }`}
                                            title="Grid View"
                                        >
                                            <Grid3x3 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => handleOpenModal()}
                                        className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl shadow-md transition whitespace-nowrap"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Add Category
                                    </button>
                                </div>
                            </div>

                            {/* Bulk Actions Toolbar */}
                            {selectedCategories.length > 0 && (
                                <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center justify-between">
                                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                        {selectedCategories.length} categories selected
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleBulkUpdateStatus(true)}
                                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition"
                                        >
                                            Activate
                                        </button>
                                        <button
                                            onClick={() => handleBulkUpdateStatus(false)}
                                            className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition"
                                        >
                                            Deactivate
                                        </button>
                                        <button
                                            onClick={handleBulkDelete}
                                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition"
                                        >
                                            Delete Selected
                                        </button>
                                        <button
                                            onClick={() => setSelectedCategories([])}
                                            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition"
                                        >
                                            Clear Selection
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Content Area */}
                            <div className="flex-1">
                                {loading ? (
                                    <div className="p-8 text-center text-gray-500">Loading categories...</div>
                                ) : viewMode === "grid" ? (
                                    // Grid View
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {filteredCategories.length > 0 ? (
                                            filteredCategories.map((cat) => (
                                                <CategoryCard key={cat._id} category={cat} />
                                            ))
                                        ) : (
                                            <div className="col-span-full py-16 text-center text-gray-500">
                                                No categories found.
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    // Table View
                                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:backdrop-blur dark:shadow-xl dark:shadow-slate-950/60 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-sm">
                                                    <tr>
                                                        <th className="py-3 px-4">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSelectAll();
                                                                }}
                                                                className="hover:bg-gray-200 dark:hover:bg-gray-600 p-1 rounded transition"
                                                                title={selectedCategories.length === filteredCategories.length && filteredCategories.length > 0 ? "Deselect All" : "Select All"}
                                                            >
                                                                {selectedCategories.length === filteredCategories.length && filteredCategories.length > 0 ? (
                                                                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                                                                ) : (
                                                                    <Square className="w-5 h-5" />
                                                                )}
                                                            </button>
                                                        </th>
                                                        <th className="py-3 px-4">Category</th>
                                                        <th className="py-3 px-4">Products</th>
                                                        <th className="py-3 px-4">Revenue</th>
                                                        <th className="py-3 px-4">Status</th>
                                                        <th className="py-3 px-4 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                    {filteredCategories.length > 0 ? (
                                                        filteredCategories.map((cat) => (
                                                            <tr key={cat._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                                                <td className="py-3 px-4">
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleSelectCategory(cat._id);
                                                                        }}
                                                                        className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded transition"
                                                                    >
                                                                        {selectedCategories.includes(cat._id) ? (
                                                                            <CheckSquare className="w-5 h-5 text-emerald-600" />
                                                                        ) : (
                                                                            <Square className="w-5 h-5 text-gray-400" />
                                                                        )}
                                                                    </button>
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <div className="flex items-center gap-3">
                                                                        {cat.icon ? (
                                                                            <img
                                                                                src={cat.icon}
                                                                                alt={cat.name}
                                                                                className="w-10 h-10 object-cover rounded"
                                                                            />
                                                                        ) : (
                                                                            <div
                                                                                className="w-10 h-10 rounded flex items-center justify-center"
                                                                                style={{ backgroundColor: cat.color + '20' }}
                                                                            >
                                                                                <Package className="w-5 h-5" style={{ color: cat.color }} />
                                                                            </div>
                                                                        )}
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-medium">{cat.name}</span>
                                                                            {cat.childrenCount > 0 && (
                                                                                <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-xs rounded-full">
                                                                                    {cat.childrenCount} sub
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                                                                        {cat.count || 0} Products
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-4 font-semibold text-green-600 dark:text-green-400">
                                                                    {formatCurrency(cat.totalRevenue)}
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleToggleStatus(cat._id, cat.isActive)}
                                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${cat.isActive
                                                                            ? 'bg-emerald-600'
                                                                            : 'bg-gray-300 dark:bg-gray-600'
                                                                            }`}
                                                                        title={cat.isActive ? "Click to deactivate" : "Click to activate"}
                                                                    >
                                                                        <span
                                                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${cat.isActive ? 'translate-x-6' : 'translate-x-1'
                                                                                }`}
                                                                        />
                                                                    </button>
                                                                </td>
                                                                <td className="py-3 px-4 text-right">
                                                                    <button
                                                                        onClick={() => handleOpenModal(cat)}
                                                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-3 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition"
                                                                        title="Edit"
                                                                    >
                                                                        <Edit2 className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(cat._id)}
                                                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition"
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="6" className="py-16 text-center text-gray-500">
                                                                No categories found.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </main>
                    <Footer />
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-800">
                        <div className="p-6 space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    {currentCategory ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                                    {currentCategory ? "Edit Category" : "Add Category"}
                                </h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    {/* Category Name */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Category Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 transition dark:bg-slate-950/50 dark:border-slate-700 dark:text-white"
                                            required
                                        />
                                    </div>

                                    {/* Parent Category */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                                            <FolderTree className="w-4 h-4" />
                                            Parent Category
                                        </label>
                                        <select
                                            value={formData.parent}
                                            onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 transition dark:bg-slate-950/50 dark:border-slate-700 dark:text-white"
                                        >
                                            <option value="">None (Root Category)</option>
                                            {categories
                                                .filter(cat => !currentCategory || cat._id !== currentCategory._id)
                                                .map(cat => (
                                                    <option key={cat._id} value={cat._id}>
                                                        {cat.name}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>

                                    {/* Color Picker */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                                            <Palette className="w-4 h-4" />
                                            Color Theme
                                        </label>
                                        <input
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="w-full h-10 px-1 py-1 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 transition dark:bg-slate-950/50 dark:border-slate-700"
                                        />
                                    </div>

                                    {/* Icon Upload */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4" />
                                            Category Icon
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 transition dark:bg-slate-950/50 dark:border-slate-700 dark:text-white"
                                        />
                                        {iconPreview && (
                                            <div className="mt-2 flex justify-center">
                                                <img
                                                    src={iconPreview}
                                                    alt="Preview"
                                                    className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 transition dark:bg-slate-950/50 dark:border-slate-700 dark:text-white"
                                            rows="3"
                                        ></textarea>
                                    </div>

                                    {/* Active Status */}
                                    <div className="md:col-span-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.isActive}
                                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Category is active
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-slate-800 mt-6">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition dark:bg-transparent dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl shadow-md transition"
                                    >
                                        {currentCategory ? "Update Category" : "Create Category"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </React.Fragment>
    );
};

export default CategoryList;
