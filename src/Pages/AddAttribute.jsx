import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X } from "lucide-react";
import axiosClient from "../api/axiosClient";

import Sidebar from "../Components/Sidebar";
import Header from "../Components/Layout/Header";
import Footer from "../Components/Layout/Footer";

const AddAttribute = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [currentValue, setCurrentValue] = useState("");
    const [values, setValues] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleAddValue = (e) => {
        e.preventDefault();
        if (currentValue.trim() && !values.includes(currentValue.trim())) {
            setValues([...values, currentValue.trim()]);
            setCurrentValue("");
        }
    };

    const removeValue = (valToRemove) => {
        setValues(values.filter((val) => val !== valToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Attribute name is required");
            return;
        }
        if (values.length === 0) {
            setError("Add at least one value");
            return;
        }

        setLoading(true);
        try {
            await axiosClient.post("/attributes", {
                name,
                values,
            });
            navigate("/attributes");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create attribute");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100">
            <Sidebar />
            <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <Header />
                <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
                    <div className="p-6 max-w-2xl mx-auto">
                        <button
                            onClick={() => navigate("/attributes")}
                            className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors dark:text-slate-400 dark:hover:text-slate-200"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Attributes
                        </button>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
                            <div className="p-6 border-b border-gray-100 dark:border-slate-800">
                                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Add New Attribute</h1>
                                <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">Create a new variant type (e.g., Size, Color)</p>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {error && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium dark:bg-red-900/20 dark:text-red-400">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-slate-300">Attribute Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Size"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-slate-300">Attribute Values</label>
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            value={currentValue}
                                            onChange={(e) => setCurrentValue(e.target.value)}
                                            placeholder="e.g. Small"
                                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddValue(e)}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddValue}
                                            className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300 dark:bg-slate-950/50 dark:border-slate-800">
                                        {values.length === 0 && <span className="text-sm text-gray-400 dark:text-slate-500">Values will appear here...</span>}
                                        {values.map((val, index) => (
                                            <span
                                                key={index}
                                                className="flex items-center gap-1.5 px-3 py-1 bg-white text-gray-700 text-sm font-medium rounded-full border border-gray-200 shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                                            >
                                                {val}
                                                <button
                                                    type="button"
                                                    onClick={() => removeValue(val)}
                                                    className="text-gray-400 hover:text-red-500"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-emerald-600 dark:hover:bg-emerald-500"
                                    >
                                        {loading ? "Creating..." : "Create Attribute"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default AddAttribute;
