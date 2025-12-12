import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Loader2, Package } from 'lucide-react';

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchOrders();
    }, []);

    async function fetchOrders() {
        try {
            const res = await axiosClient.get('/orders/my-orders');
            setOrders(res.data.orders);
        } catch (err) {
            setError("Failed to load orders.");
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-10 text-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <h1 className="text-2xl font-bold mb-6">My Orders</h1>

            {orders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center">
                    <Package className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-gray-500">You haven't placed any orders yet.</p>
                    <Link to="/products" className="mt-4 inline-block text-sm font-medium text-black underline">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Link
                            key={order._id}
                            to={`/account/orders/${order._id}`}
                            className="block rounded-xl border border-gray-200 bg-white p-4 transition hover:bg-gray-50"
                        >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Order #{order._id.slice(-6).toUpperCase()}</p>
                                    <p className="text-xs text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">₹{order.totalAmount}</p>
                                        <p className="text-xs text-gray-500">{order.items.length} items</p>
                                    </div>

                                    <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize 
                     ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-blue-100 text-blue-700'}`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
