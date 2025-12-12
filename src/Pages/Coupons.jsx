import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ticket, Plus, Search, Calendar, TrendingUp } from "lucide-react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Layout/Header";
import Footer from "../Components/Layout/Footer";
import { apiRequest } from "../api/api";

const Coupons = () => {
    const navigate = useNavigate();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            if (statusFilter) params.append("status", statusFilter);

            const res = await apiRequest(`/coupons?${params.toString()}`);
            if (res.success) {
                setCoupons(res.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch coupons:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, [search, statusFilter]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this coupon?")) return;

        try {
            const res = await apiRequest(`/coupons/${id}`, { method: "DELETE" });
            if (res.success) {
                fetchCoupons();
            }
        } catch (error) {
            console.error("Failed to delete coupon:", error);
            alert("Failed to delete coupon");
        }
    };

    const getStatusBadge = (coupon) => {
        const isExpired = new Date() > new Date(coupon.validUntil);
        if (!coupon.isActive) {
            return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">Inactive</span>;
        }
        if (isExpired) {
            return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400">Expired</span>;
        }
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Active</span>;
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
                                    <Ticket className="w-7 h-7 text-emerald-500" />
                                    Coupons
                                </h1>
                                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                                    Manage discount codes and promotions
                                </p>
                            </div>
                            <button
                                onClick={() => navigate("/coupons/add")}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Create Coupon
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by coupon code..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 outline-none focus:border-emerald-500"
                                    />
                                </div>

                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 outline-none focus:border-emerald-500"
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="expired">Expired</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        {/* Coupons Table */}
                        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/70 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50 dark:bg-slate-900/80 border-b border-gray-200 dark:border-slate-800">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                                                Code
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                                                Discount
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                                                Used
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                                                Valid Until
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
                                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                                    Loading coupons...
                                                </td>
                                            </tr>
                                        ) : coupons.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                                    No coupons found
                                                </td>
                                            </tr>
                                        ) : (
                                            coupons.map((coupon) => (
                                                <tr
                                                    key={coupon._id}
                                                    className="hover:bg-gray-50 dark:hover:bg-slate-900/60 transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-gray-900 dark:text-slate-100">
                                                            {coupon.code}
                                                        </div>
                                                        {coupon.description && (
                                                            <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                                                                {coupon.description}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-300">
                                                        {coupon.type === "percentage" ? `${coupon.value}%` : `$${coupon.value}`}
                                                        {coupon.maxDiscount && <span className="text-xs text-gray-400"> (max ${coupon.maxDiscount})</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                                                            {coupon.usedCount}
                                                        </span>
                                                        {coupon.usageLimit && (
                                                            <span className="text-xs text-gray-400">/{coupon.usageLimit}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-300">
                                                        {new Date(coupon.validUntil).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {getStatusBadge(coupon)}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex gap-2 justify-center">
                                                            <button
                                                                onClick={() => navigate(`/coupons/${coupon._id}/edit`)}
                                                                className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(coupon._id)}
                                                                className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium transition-colors"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
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
        </div>
    );
};

export default Coupons;
