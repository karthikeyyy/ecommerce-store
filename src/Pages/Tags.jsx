import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Layout/Header";
import Footer from "../Components/Layout/Footer";
import { apiRequest } from "../api/api";
import {
    Search, Plus, X, Edit2, Trash2, Grid3x3, List,
    Palette, CheckSquare, Square, Tag as TagIcon
} from "lucide-react";

const Tags = () => {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTag, setCurrentTag] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        color: "#3b82f6",
        isActive: true
    });
    const [viewMode, setViewMode] = useState("table"); // "table" or "grid"
    const [selectedTags, setSelectedTags] = useState([]);

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const response = await apiRequest("/tags");
            setTags(response.data || []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching tags:", error);
            setTags([]);
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filter tags based on search term
    const filteredTags = tags.filter(tag =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (tag = null) => {
        if (tag) {
            setCurrentTag(tag);
            setFormData({
                name: tag.name,
                color: tag.color || "#3b82f6",
                isActive: tag.isActive !== undefined ? tag.isActive : true
            });
        } else {
            setCurrentTag(null);
            setFormData({
                name: "",
                color: "#3b82f6",
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentTag(null);
        setFormData({
            name: "",
            color: "#3b82f6",
            isActive: true
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentTag) {
                await apiRequest(`/tags/${currentTag._id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });
            } else {
                await apiRequest("/tags", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });
            }
            fetchTags();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving tag:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this tag?")) {
            try {
                const response = await apiRequest(`/tags/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (response.success) {
                    fetchTags();
                    setSelectedTags(selectedTags.filter(tagId => tagId !== id));
                } else {
                    alert(response.message || "Failed to delete tag");
                }
            } catch (error) {
                console.error("Error deleting tag:", error);
                alert("An error occurred while deleting the tag");
            }
        }
    };

    const handleSelectTag = (id) => {
        if (selectedTags.includes(id)) {
            setSelectedTags(selectedTags.filter(tagId => tagId !== id));
        } else {
            setSelectedTags([...selectedTags, id]);
        }
    };

    const handleSelectAll = () => {
        if (selectedTags.length === filteredTags.length) {
            setSelectedTags([]);
        } else {
            setSelectedTags(filteredTags.map(tag => tag._id));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedTags.length === 0) return;

        if (window.confirm(`Are you sure you want to delete ${selectedTags.length} tags?`)) {
            try {
                await apiRequest("/tags/bulk-delete", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ ids: selectedTags }),
                });
                fetchTags();
                setSelectedTags([]);
            } catch (error) {
                console.error("Error bulk deleting tags:", error);
            }
        }
    };

    const handleBulkUpdateStatus = async (isActive) => {
        if (selectedTags.length === 0) return;

        try {
            await apiRequest("/tags/bulk-status", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ids: selectedTags, isActive }),
            });
            fetchTags();
            setSelectedTags([]);
        } catch (error) {
            console.error("Error updating tag status:", error);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await apiRequest(`/tags/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            fetchTags();
        } catch (error) {
            console.error("Error toggling tag status:", error);
        }
    };

    const TagCard = ({ tag }) => (
        <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200 dark:border-gray-700"
            style={{ borderTopColor: tag.color, borderTopWidth: '4px' }}
        >
            <div className="p-6">
                {/* Selection Checkbox */}
                <div className="flex items-start justify-between mb-4">
                    <button
                        onClick={() => handleSelectTag(tag._id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        {selectedTags.includes(tag._id) ? (
                            <CheckSquare className="w-5 h-5 text-green-600" />
                        ) : (
                            <Square className="w-5 h-5" />
                        )}
                    </button>
                    {!tag.isActive && (
                        <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                            Inactive
                        </span>
                    )}
                </div>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div
                        className="w-20 h-20 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: tag.color + '20' }}
                    >
                        <TagIcon className="w-10 h-10" style={{ color: tag.color }} />
                    </div>
                </div>

                {/* Tag Name */}
                <h3 className="text-lg font-bold text-center mb-2 text-gray-800 dark:text-white">
                    {tag.name}
                </h3>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={() => handleOpenModal(tag)}
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center justify-center gap-2"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit
                    </button>
                    <button
                        onClick={() => handleDelete(tag._id)}
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
                                    <h1 className="text-3xl font-semibold tracking-tight">Tags</h1>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Manage product tags</p>
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <div className="relative flex-1 md:w-64">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            placeholder="Search tags..."
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
                                        Add Tag
                                    </button>
                                </div>
                            </div>

                            {/* Bulk Actions Toolbar */}
                            {selectedTags.length > 0 && (
                                <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center justify-between">
                                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                        {selectedTags.length} tags selected
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
                                            onClick={() => setSelectedTags([])}
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
                                    <div className="p-8 text-center text-gray-500">Loading tags...</div>
                                ) : viewMode === "grid" ? (
                                    // Grid View
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {filteredTags.length > 0 ? (
                                            filteredTags.map((tag) => (
                                                <TagCard key={tag._id} tag={tag} />
                                            ))
                                        ) : (
                                            <div className="col-span-full py-16 text-center text-gray-500">
                                                No tags found.
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
                                                                title={selectedTags.length === filteredTags.length && filteredTags.length > 0 ? "Deselect All" : "Select All"}
                                                            >
                                                                {selectedTags.length === filteredTags.length && filteredTags.length > 0 ? (
                                                                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                                                                ) : (
                                                                    <Square className="w-5 h-5" />
                                                                )}
                                                            </button>
                                                        </th>
                                                        <th className="py-3 px-4">Tag</th>
                                                        <th className="py-3 px-4">Status</th>
                                                        <th className="py-3 px-4 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                    {filteredTags.length > 0 ? (
                                                        filteredTags.map((tag) => (
                                                            <tr key={tag._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                                                <td className="py-3 px-4">
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleSelectTag(tag._id);
                                                                        }}
                                                                        className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded transition"
                                                                    >
                                                                        {selectedTags.includes(tag._id) ? (
                                                                            <CheckSquare className="w-5 h-5 text-emerald-600" />
                                                                        ) : (
                                                                            <Square className="w-5 h-5 text-gray-400" />
                                                                        )}
                                                                    </button>
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div
                                                                            className="w-8 h-8 rounded flex items-center justify-center"
                                                                            style={{ backgroundColor: tag.color + '20' }}
                                                                        >
                                                                            <TagIcon className="w-4 h-4" style={{ color: tag.color }} />
                                                                        </div>
                                                                        <span className="font-medium">{tag.name}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleToggleStatus(tag._id, tag.isActive)}
                                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${tag.isActive
                                                                            ? 'bg-emerald-600'
                                                                            : 'bg-gray-300 dark:bg-gray-600'
                                                                            }`}
                                                                        title={tag.isActive ? "Click to deactivate" : "Click to activate"}
                                                                    >
                                                                        <span
                                                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${tag.isActive ? 'translate-x-6' : 'translate-x-1'
                                                                                }`}
                                                                        />
                                                                    </button>
                                                                </td>
                                                                <td className="py-3 px-4 text-right">
                                                                    <button
                                                                        onClick={() => handleOpenModal(tag)}
                                                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-3 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition"
                                                                        title="Edit"
                                                                    >
                                                                        <Edit2 className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(tag._id)}
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
                                                            <td colSpan="4" className="py-16 text-center text-gray-500">
                                                                No tags found.
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
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-800">
                        <div className="p-6 space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    {currentTag ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                                    {currentTag ? "Edit Tag" : "Add Tag"}
                                </h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-4">
                                    {/* Tag Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Tag Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 transition dark:bg-slate-950/50 dark:border-slate-700 dark:text-white"
                                            required
                                        />
                                    </div>

                                    {/* Color Picker */}
                                    <div>
                                        <label className="black text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
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

                                    {/* Active Status */}
                                    <div>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.isActive}
                                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Tag is active
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
                                        {currentTag ? "Update Tag" : "Create Tag"}
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

export default Tags;
