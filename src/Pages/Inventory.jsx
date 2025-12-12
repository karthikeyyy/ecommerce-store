import React, { useEffect, useState } from "react";
import { Package, AlertTriangle, TrendingDown, Edit2, Search, Filter } from "lucide-react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Layout/Header";
import Footer from "../Components/Layout/Footer";
import { apiRequest } from "../api/api";

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [stockFilter, setStockFilter] = useState("");
    const [showLowStock, setShowLowStock] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [newStock, setNewStock] = useState("");
    const [reason, setReason] = useState("");
    const [showModal, setShowModal] = useState(false);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            if (stockFilter) params.append("stockStatus", stockFilter);
            if (showLowStock) params.append("lowStock", "true");

            const res = await apiRequest(`/inventory?${params.toString()}`);
            if (res.success) {
                setProducts(res.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, [search, stockFilter, showLowStock]);

    const handleUpdateStock = async () => {
        if (!selectedProduct || !newStock) return;

        try {
            const res = await apiRequest(`/inventory/${selectedProduct._id}`, {
                method: "PUT",
                body: JSON.stringify({
                    stock: parseInt(newStock),
                    reason,
                }),
            });

            if (res.success) {
                setShowModal(false);
                setSelectedProduct(null);
                setNewStock("");
                setReason("");
                fetchInventory();
            }
        } catch (error) {
            console.error("Failed to update stock:", error);
            alert("Failed to update stock");
        }
    };

    const openUpdateModal = (product) => {
        setSelectedProduct(product);
        const currentStock = product.stock > 0 ? product.stock : (product.quantity || 0);
        setNewStock(currentStock.toString());
        setShowModal(true);
    };

    const getStockStatusColor = (status) => {
        switch (status) {
            case "In Stock":
                return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
            case "Low Stock":
                return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
            case "Out of Stock":
                return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Header */}
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2 text-gray-900 dark:text-slate-100">
                                    <Package className="w-7 h-7 text-emerald-500" />
                                    Inventory Management
                                </h1>
                                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                                    Track and manage product stock levels
                                </p>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or SKU..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 outline-none focus:border-emerald-500"
                                    />
                                </div>

                                <select
                                    value={stockFilter}
                                    onChange={(e) => setStockFilter(e.target.value)}
                                    className="px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 outline-none focus:border-emerald-500"
                                >
                                    <option value="">All Stock Status</option>
                                    <option value="In Stock">In Stock</option>
                                    <option value="Low Stock">Low Stock</option>
                                    <option value="Out of Stock">Out of Stock</option>
                                </select>

                                <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-950/60 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showLowStock}
                                        onChange={(e) => setShowLowStock(e.target.checked)}
                                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-slate-300">
                                        Show Low Stock Only
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Stock Summary Cards */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-slate-400">
                                            Total Products
                                        </p>
                                        <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-slate-100">
                                            {products.length}
                                        </p>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
                                        <Package className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-slate-400">
                                            Low Stock
                                        </p>
                                        <p className="mt-2 text-2xl font-semibold text-amber-600 dark:text-amber-400">
                                            {products.filter((p) => p.stockStatus === "Low Stock").length}
                                        </p>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-500/10">
                                        <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-slate-400">
                                            Out of Stock
                                        </p>
                                        <p className="mt-2 text-2xl font-semibold text-rose-600 dark:text-rose-400">
                                            {products.filter((p) => p.stockStatus === "Out of Stock").length}
                                        </p>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-500/10">
                                        <TrendingDown className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Inventory Table */}
                        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/70 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50 dark:bg-slate-900/80 border-b border-gray-200 dark:border-slate-800">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                                                Product
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                                                SKU
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                                                Stock
                                            </th>

                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                                    Loading inventory...
                                                </td>
                                            </tr>
                                        ) : products.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                                    No products found
                                                </td>
                                            </tr>
                                        ) : (
                                            products.map((product) => (
                                                <tr
                                                    key={product._id}
                                                    className="hover:bg-gray-50 dark:hover:bg-slate-900/60 transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-900 dark:text-slate-100">
                                                            {product.name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                                                        {product.sku || "—"}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                                                            {product.stock > 0 ? product.stock : (product.quantity || 0)}
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockStatusColor(
                                                                product.stockStatus
                                                            )}`}
                                                        >
                                                            {product.stockStatus}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => openUpdateModal(product)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors"
                                                        >
                                                            <Edit2 className="w-3 h-3" />
                                                            Update
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>

            {/* Update Stock Modal */}
            {showModal && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">
                            Update Stock: {selectedProduct.name}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                    Current Stock: {selectedProduct.stock > 0 ? selectedProduct.stock : (selectedProduct.quantity || 0)}
                                </label>
                                <input
                                    type="number"
                                    value={newStock}
                                    onChange={(e) => setNewStock(e.target.value)}
                                    min="0"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 outline-none focus:border-emerald-500"
                                    placeholder="New stock quantity"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                    Reason (Optional)
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows="3"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 outline-none focus:border-emerald-500"
                                    placeholder="Enter reason for stock adjustment..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedProduct(null);
                                    setNewStock("");
                                    setReason("");
                                }}
                                className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateStock}
                                className="flex-1 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors"
                            >
                                Update Stock
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
