import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, User, LogOut, Package } from 'lucide-react';

export default function MyAccount() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-10">
            <h1 className="text-3xl font-bold mb-2">My Account</h1>
            <p className="text-gray-600 mb-8">Welcome back, {user.name}!</p>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Orders Card */}
                <Link to="/account/orders" className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                        <Package size={24} />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">My Orders</h2>
                    <p className="mt-2 text-sm text-gray-500">Track current orders and view history</p>
                </Link>

                {/* Profile Card */}
                <Link to="/account/profile" className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
                        <User size={24} />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Profile Details</h2>
                    <p className="mt-2 text-sm text-gray-500">Manage your address and contact info</p>
                </Link>

                {/* Wishlist Card - Assuming you have one */}
                <Link to="/wishlist" className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-pink-50 text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition">
                        <ShoppingBag size={24} />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Wishlist</h2>
                    <p className="mt-2 text-sm text-gray-500">View your saved items</p>
                </Link>
            </div>

            <div className="mt-10">
                <button
                    onClick={logout}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
