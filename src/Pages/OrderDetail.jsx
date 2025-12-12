import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Loader2, ArrowLeft, MapPin, Package } from 'lucide-react';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Layout/Header';
import Footer from '../Components/Layout/Footer';

export default function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updating, setUpdating] = useState(false);

    const fetchOrder = useCallback(async () => {
        try {
            const res = await axiosClient.get(`/orders/${id}`);
            setOrder(res.data.order);
        } catch (err) {
            setError("Failed to load order details.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    async function updateStatus(newStatus) {
        if (!window.confirm(`Update order status to "${newStatus}"?`)) return;

        try {
            setUpdating(true);
            const res = await axiosClient.patch(`/orders/admin/orders/${id}`, { status: newStatus });
            setOrder(res.data.order);
        } catch (err) {
            alert("Failed to update status");
        } finally {
            setUpdating(false);
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    <Header />
                    <main className="flex-1 p-10 text-center text-red-500">{error || "Order not found"}</main>
                    <Footer />
                </div>
            </div>
        );
    }

    const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100">
            <Sidebar />
            <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <Header />
                <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
                    <div className="max-w-5xl mx-auto">
                        <button
                            onClick={() => navigate('/orders')}
                            className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black dark:text-slate-400 dark:hover:text-white"
                        >
                            <ArrowLeft size={16} /> Back to Orders
                        </button>

                        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                                    Order #{order._id.slice(-6).toUpperCase()}
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-slate-400">
                                    Placed on {new Date(order.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-medium text-gray-500 dark:text-slate-400">Update Status</label>
                                <select
                                    value={order.status}
                                    onChange={(e) => updateStatus(e.target.value)}
                                    disabled={updating}
                                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium capitalize dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                >
                                    {statuses.map((s) => (
                                        <option key={s} value={s} className="capitalize">
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid gap-8 lg:grid-cols-3">
                            {/* Order Items */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="rounded-xl border border-gray-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900/70">
                                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 dark:bg-slate-900/80 dark:border-slate-800">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                                            <Package size={16} /> Items
                                        </h3>
                                    </div>
                                    <div className="divide-y divide-gray-200 dark:divide-slate-800">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 p-4">
                                                <div className="h-16 w-16 flex-shrink-0 rounded bg-gray-100 overflow-hidden dark:bg-slate-800">
                                                    {item.product?.mainImage && (
                                                        <img
                                                            src={item.product.mainImage}
                                                            alt={item.product.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                                                        {item.product?.name || "Product"}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-slate-400">
                                                        Qty: {item.quantity} × ₹{item.price}
                                                    </p>
                                                    <div className="mt-1 flex flex-wrap gap-2">
                                                        {item.selectedAttributes?.map((attr, i) => (
                                                            <span key={i} className="text-xs text-gray-500 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">
                                                                {attr.name}: {attr.value}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                                                    ₹{item.price * item.quantity}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Shipping & Payment Info */}
                            <div className="space-y-6">
                                <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70">
                                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-100">
                                        <MapPin size={16} /> Shipping Address
                                    </h3>
                                    <div className="text-sm text-gray-600 dark:text-slate-300">
                                        <p>{order.shippingAddress.fullName}</p>
                                        <p>{order.shippingAddress.address}</p>
                                        <p>
                                            {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                                            {order.shippingAddress.postalCode}
                                        </p>
                                        <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                                            Phone: {order.shippingAddress.phone}
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70">
                                    <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-slate-100">
                                        Customer Info
                                    </h3>
                                    <div className="text-sm text-gray-600 dark:text-slate-300">
                                        <p className="font-medium">{order.user?.name || "Unknown"}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400">{order.user?.email || "No email"}</p>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70">
                                    <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-slate-100">
                                        Order Summary
                                    </h3>
                                    <div className="flex justify-between text-sm py-2 border-b border-gray-100 dark:border-slate-800">
                                        <span className="text-gray-600 dark:text-slate-400">Total Amount</span>
                                        <span className="font-bold text-gray-900 dark:text-slate-100">
                                            ₹{order.totalAmount}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm py-2">
                                        <span className="text-gray-600 dark:text-slate-400">Payment</span>
                                        <span className="text-gray-900 dark:text-slate-100">{order.paymentMethod}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
}
