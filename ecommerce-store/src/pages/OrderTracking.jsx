import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function OrderTracking() {
    const [orderId, setOrderId] = useState("");
    const navigate = useNavigate();

    const handleTrack = (e) => {
        e.preventDefault();
        if (orderId.trim()) {
            // Redirect to order details. 
            // Note: This assumes the user is logged in to view details, 
            // or the order detail page allows public access context (which it might not yet).
            // For now, let's redirect to the account orders page.
            navigate(`/account/orders/${orderId.trim()}`);
        }
    };

    return (
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
            <h1 className="text-3xl font-bold mb-6">Track Your Order</h1>
            <p className="text-gray-600 mb-8">Enter your Order ID below to check its status.</p>

            <form onSubmit={handleTrack} className="flex gap-2 max-w-md mx-auto">
                <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Order ID (e.g. 64f...)"
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-black"
                    required
                />
                <button type="submit" className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition">
                    Track
                </button>
            </form>

            <p className="mt-8 text-sm text-gray-500">
                Logs in to your account for better tracking? <a href="/login" className="text-black underline">Login here</a>
            </p>
        </div>
    );
}

export default OrderTracking;
