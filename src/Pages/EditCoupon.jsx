import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Ticket } from "lucide-react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Layout/Header";
import Footer from "../Components/Layout/Footer";
import { apiRequest } from "../api/api";

const EditCoupon = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [formData, setFormData] = useState({
        code: "",
        description: "",
        type: "percentage",
        value: "",
        minPurchase: "",
        maxDiscount: "",
        usageLimit: "",
        validFrom: "",
        validUntil: "",
        isActive: true,
    });

    useEffect(() => {
        fetchCoupon();
    }, [id]);

    const fetchCoupon = async () => {
        try {
            const res = await apiRequest(`/coupons/${id}`);
            if (res.success) {
                const coupon = res.data;
                setFormData({
                    code: coupon.code,
                    description: coupon.description || "",
                    type: coupon.type,
                    value: coupon.value,
                    minPurchase: coupon.minPurchase || "",
                    maxDiscount: coupon.maxDiscount || "",
                    usageLimit: coupon.usageLimit || "",
                    validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : "",
                    validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : "",
                    isActive: coupon.isActive,
                });
            }
        } catch (error) {
            console.error("Failed to fetch coupon:", error);
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await apiRequest(`/coupons/${id}`, {
                method: "PUT",
                body: JSON.stringify(formData),
            });

            if (res.success) {
                navigate("/coupons");
            } else {
                alert(res.message || "Failed to update coupon");
            }
        } catch (error) {
            console.error("Failed to update coupon:", error);
            alert("Failed to update coupon");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
                <p>Loading coupon...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2 text-gray-900 dark:text-slate-100">
                                <Ticket className="w-7 h-7 text-emerald-500" />
                                Edit Coupon
                            </h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                                Update coupon details
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Info */}
                            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
                                    Basic Information
                                </h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                            Coupon Code *
                                        </label>
                                        <input
                                            type="text"
                                            name="code"
                                            value={formData.code}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 outline-none focus:border-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                            Description
                                        </label>
                                        <input
                                            type="text"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Discount Details */}
                            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
                                    Discount Details
                                </h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                            Discount Type *
                                        </label>
                                        <select
                                            name="type"
                                            value={formData.type}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 outline-none focus:border-emerald-500"
                                        >
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="fixed">Fixed Amount ($)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                            Discount Value *
                                        </label>
                                        <input
                                            type="number"
                                            name="value"
                                            value={formData.value}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                            step="0.01"
                                            className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 outline-none focus:border-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                            Minimum Purchase
                                        </label>
                                        <input
                                            type="number"
                                            name="minPurchase"
                                            value={formData.minPurchase}
                                            onChange={handleChange}
                                            min="0"
                                            step="0.01"
                                            className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 outline-none focus:border-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                            Maximum Discount
                                        </label>
                                        <input
                                            type="number"
                                            name="maxDiscount"
                                            value={formData.maxDiscount}
                                            onChange={handleChange}
                                            min="0"
                                            step="0.01"
                                            className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Validity & Usage */}
                            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
                                    Validity & Usage Limits
                                </h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                            Valid From *
                                        </label>
                                        <input
                                            type="date"
                                            name="validFrom"
                                            value={formData.validFrom}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 outline-none focus:border-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                            Valid Until *
                                        </label>
                                        <input
                                            type="date"
                                            name="validUntil"
                                            value={formData.validUntil}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 outline-none focus:border-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                            Usage Limit
                                        </label>
                                        <input
                                            type="number"
                                            name="usageLimit"
                                            value={formData.usageLimit}
                                            onChange={handleChange}
                                            min="0"
                                            className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 outline-none focus:border-emerald-500"
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="isActive"
                                                checked={formData.isActive}
                                                onChange={handleChange}
                                                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                                                Active
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => navigate("/coupons")}
                                    className="flex-1 px-6 py-3 rounded-xl border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors disabled:opacity-50"
                                >
                                    {loading ? "Updating..." : "Update Coupon"}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default EditCoupon;
