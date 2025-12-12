import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit2, Trash2 } from "lucide-react";
import axiosClient from "../api/axiosClient";

import Sidebar from "../Components/Sidebar";
import Header from "../Components/Layout/Header";
import Footer from "../Components/Layout/Footer";

const Attributes = () => {
    const [attributes, setAttributes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAttributes();
    }, []);

    const fetchAttributes = async () => {
        try {
            const { data } = await axiosClient.get("/attributes");
            setAttributes(data);
        } catch (error) {
            console.error("Error fetching attributes:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteAttribute = async (id) => {
        if (window.confirm("Are you sure?")) {
            try {
                await axiosClient.delete(`/attributes/${id}`);
                setAttributes(attributes.filter((attr) => attr._id !== id));
            } catch (error) {
                console.error("Error deleting attribute:", error);
            }
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100">
            <Sidebar />
            <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <Header />
                <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Attributes</h1>
                                <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">Manage product variants like Size, Color, etc.</p>
                            </div>
                            <Link
                                to="/attributes/add"
                                className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-gray-800 transition-colors dark:bg-emerald-600 dark:hover:bg-emerald-500"
                            >
                                <Plus className="w-4 h-4" />
                                Add Attribute
                            </Link>
                        </div>

                        {loading ? (
                            <div className="p-4 text-center">Loading...</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {attributes.map((attr) => (
                                    <div key={attr._id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{attr.name}</h3>
                                            <div className="flex gap-2">
                                                <Link
                                                    to={`/attributes/${attr._id}/edit`}
                                                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors dark:text-slate-400 dark:hover:bg-slate-800"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => deleteAttribute(attr._id)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-900/20"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {attr.values.map((val, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md border border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                                                >
                                                    {val}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {attributes.length === 0 && (
                                    <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300 dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-400">
                                        No attributes found. Create one to get started.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default Attributes;
