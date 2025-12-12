import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Loader2, ArrowLeft, MapPin, Truck } from 'lucide-react';

export default function OrderDetails() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchOrder() {
            try {
                const res = await axiosClient.get(`/orders/${id}`);
                setOrder(res.data.order);
            } catch (err) {
                setError("Failed to load order details.");
            } finally {
                setLoading(false);
            }
        }
        fetchOrder();
    }, [id]);

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
    if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
    if (!order) return <div className="p-10 text-center">Order not found</div>;

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <Link to="/account/orders" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black">
                <ArrowLeft size={16} /> Back to Orders
            </Link>

            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Order #{order._id.slice(-6).toUpperCase()}</h1>
                    <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className={`rounded-full px-3 py-1 text-sm font-medium capitalize 
             ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700'}`}>
                        {order.status}
                    </span>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Order Items */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-900">Items</h3>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-4">
                                    <div className="h-16 w-16 flex-shrink-0 rounded bg-gray-100 overflow-hidden">
                                        {item.product?.mainImage && <img src={item.product.mainImage} alt={item.product.name} className="h-full w-full object-cover" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{item.product?.name || "Product"}</p>
                                        {item.selectedAttributes && item.selectedAttributes.length > 0 && (
                                            <div className="mt-1 flex flex-wrap gap-1.5">
                                                {item.selectedAttributes.map((attr, i) => (
                                                    <span key={i} className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 border border-gray-200">
                                                        <span className="text-gray-500 mr-1">{attr.name}:</span> {attr.value}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">₹{item.price * item.quantity}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Shipping & Payment Info */}
                <div className="space-y-6">
                    <div className="rounded-xl border border-gray-200 bg-white p-5">
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                            <MapPin size={16} /> Shipping Address
                        </h3>
                        <div className="text-sm text-gray-600">
                            <p>{order.shippingAddress.fullName}</p>
                            <p>{order.shippingAddress.address}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                            <p className="mt-2 text-xs text-gray-500">Phone: {order.shippingAddress.phone}</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5">
                        <h3 className="mb-3 text-sm font-semibold text-gray-900">Order Summary</h3>
                        <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                            <span className="text-gray-600">Total Amount</span>
                            <span className="font-bold text-gray-900">₹{order.totalAmount}</span>
                        </div>
                        <div className="flex justify-between text-sm py-2">
                            <span className="text-gray-600">Payment</span>
                            <span className="text-gray-900">{order.paymentMethod}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
