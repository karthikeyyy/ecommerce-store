import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, Lock, MapPin, ArrowLeft, Plus, Trash2, Edit2, Check } from "lucide-react";

function EditProfile() {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();

    // Profile state
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    // Password state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Address state
    const [addresses, setAddresses] = useState([]);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddressIndex, setEditingAddressIndex] = useState(null);
    const [addressForm, setAddressForm] = useState({
        label: "Home",
        fullName: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        phone: "",
        isDefault: false
    });

    // UI state
    const [activeTab, setActiveTab] = useState("profile");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setEmail(user.email || "");
            setPhone(user.phone || "");
            setAddresses(user.addresses || []);
        } else {
            navigate("/login");
        }
    }, [user, navigate]);

    async function handleProfileSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            await updateProfile({ name, email, phone });
            setSuccess("Profile updated successfully!");
        } catch (err) {
            console.error(err);
            setError("Failed to update profile. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function handlePasswordSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        setLoading(true);

        try {
            await updateProfile({
                currentPassword,
                newPassword
            });
            setSuccess("Password updated successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to update password. Please check your current password.");
        } finally {
            setLoading(false);
        }
    }

    function resetAddressForm() {
        setAddressForm({
            label: "Home",
            fullName: "",
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
            phone: "",
            isDefault: false
        });
        setShowAddressForm(false);
        setEditingAddressIndex(null);
    }

    function handleEditAddress(index) {
        setAddressForm(addresses[index]);
        setEditingAddressIndex(index);
        setShowAddressForm(true);
    }

    async function handleAddressSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            let updatedAddresses;

            if (editingAddressIndex !== null) {
                // Editing existing address
                updatedAddresses = [...addresses];
                updatedAddresses[editingAddressIndex] = addressForm;
            } else {
                // Adding new address
                updatedAddresses = [...addresses, addressForm];
            }

            // If this address is set as default, remove default from others
            if (addressForm.isDefault) {
                updatedAddresses = updatedAddresses.map((addr, idx) => ({
                    ...addr,
                    isDefault: idx === (editingAddressIndex !== null ? editingAddressIndex : updatedAddresses.length - 1)
                }));
            }

            await updateProfile({ addresses: updatedAddresses });
            setAddresses(updatedAddresses);
            setSuccess(editingAddressIndex !== null ? "Address updated successfully!" : "Address added successfully!");
            resetAddressForm();
        } catch (err) {
            console.error(err);
            setError("Failed to save address. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteAddress(index) {
        if (!window.confirm("Are you sure you want to delete this address?")) return;

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const updatedAddresses = addresses.filter((_, i) => i !== index);
            await updateProfile({ addresses: updatedAddresses });
            setAddresses(updatedAddresses);
            setSuccess("Address deleted successfully!");
        } catch (err) {
            console.error(err);
            setError("Failed to delete address. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function handleSetDefaultAddress(index) {
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const updatedAddresses = addresses.map((addr, i) => ({
                ...addr,
                isDefault: i === index
            }));
            await updateProfile({ addresses: updatedAddresses });
            setAddresses(updatedAddresses);
            setSuccess("Default address updated!");
        } catch (err) {
            console.error(err);
            setError("Failed to update default address.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-12">
            {/* Back Button */}
            <button
                onClick={() => navigate("/account")}
                className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition"
            >
                <ArrowLeft size={16} />
                Back to My Account
            </button>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => { setActiveTab("profile"); setError(""); setSuccess(""); }}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition ${activeTab === "profile"
                                ? "text-black dark:text-white border-b-2 border-black dark:border-white bg-gray-50 dark:bg-gray-700"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            }`}
                    >
                        <User size={18} />
                        Profile
                    </button>
                    <button
                        onClick={() => { setActiveTab("addresses"); setError(""); setSuccess(""); resetAddressForm(); }}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition ${activeTab === "addresses"
                                ? "text-black dark:text-white border-b-2 border-black dark:border-white bg-gray-50 dark:bg-gray-700"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            }`}
                    >
                        <MapPin size={18} />
                        Addresses
                    </button>
                    <button
                        onClick={() => { setActiveTab("password"); setError(""); setSuccess(""); }}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition ${activeTab === "password"
                                ? "text-black dark:text-white border-b-2 border-black dark:border-white bg-gray-50 dark:bg-gray-700"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            }`}
                    >
                        <Lock size={18} />
                        Password
                    </button>
                </div>

                <div className="p-6 md:p-8">
                    {error && (
                        <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 rounded-lg bg-green-50 dark:bg-green-900/30 p-3 text-sm text-green-600 dark:text-green-400">
                            {success}
                        </div>
                    )}

                    {/* Profile Settings Tab */}
                    {activeTab === "profile" && (
                        <form onSubmit={handleProfileSubmit}>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Profile Information</h2>

                            <div className="mb-4">
                                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                                    placeholder="Optional"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => navigate("/account")}
                                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 rounded-lg bg-black dark:bg-white px-4 py-2.5 text-sm font-medium text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition disabled:opacity-70"
                                    disabled={loading}
                                >
                                    {loading ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Addresses Tab */}
                    {activeTab === "addresses" && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Saved Addresses</h2>
                                {!showAddressForm && (
                                    <button
                                        onClick={() => setShowAddressForm(true)}
                                        className="inline-flex items-center gap-2 rounded-lg bg-black dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition"
                                    >
                                        <Plus size={16} />
                                        Add Address
                                    </button>
                                )}
                            </div>

                            {/* Address Form */}
                            {showAddressForm && (
                                <form onSubmit={handleAddressSubmit} className="mb-6 p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        {editingAddressIndex !== null ? "Edit Address" : "Add New Address"}
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Label
                                            </label>
                                            <select
                                                value={addressForm.label}
                                                onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-black dark:focus:border-white focus:outline-none"
                                            >
                                                <option value="Home">Home</option>
                                                <option value="Work">Work</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                value={addressForm.fullName}
                                                onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-black dark:focus:border-white focus:outline-none"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Street Address
                                        </label>
                                        <input
                                            type="text"
                                            value={addressForm.street}
                                            onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-black dark:focus:border-white focus:outline-none"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                value={addressForm.city}
                                                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-black dark:focus:border-white focus:outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                State / Province
                                            </label>
                                            <input
                                                type="text"
                                                value={addressForm.state}
                                                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-black dark:focus:border-white focus:outline-none"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                ZIP / Postal Code
                                            </label>
                                            <input
                                                type="text"
                                                value={addressForm.zipCode}
                                                onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-black dark:focus:border-white focus:outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Country
                                            </label>
                                            <input
                                                type="text"
                                                value={addressForm.country}
                                                onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-black dark:focus:border-white focus:outline-none"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={addressForm.phone}
                                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-black dark:focus:border-white focus:outline-none"
                                            required
                                        />
                                    </div>

                                    <div className="mb-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={addressForm.isDefault}
                                                onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                                                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Set as default address</span>
                                        </label>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={resetAddressForm}
                                            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                                            disabled={loading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 rounded-lg bg-black dark:bg-white px-4 py-2.5 text-sm font-medium text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition disabled:opacity-70"
                                            disabled={loading}
                                        >
                                            {loading ? "Saving..." : (editingAddressIndex !== null ? "Update Address" : "Save Address")}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Saved Addresses List */}
                            {addresses.length === 0 && !showAddressForm ? (
                                <div className="text-center py-12">
                                    <MapPin size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">No saved addresses yet</p>
                                    <button
                                        onClick={() => setShowAddressForm(true)}
                                        className="inline-flex items-center gap-2 rounded-lg bg-black dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition"
                                    >
                                        <Plus size={16} />
                                        Add Your First Address
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {addresses.map((address, index) => (
                                        <div
                                            key={index}
                                            className={`relative p-4 rounded-xl border ${address.isDefault
                                                    ? "border-black dark:border-white bg-gray-50 dark:bg-gray-700"
                                                    : "border-gray-200 dark:border-gray-600"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                                                            {address.label}
                                                        </span>
                                                        {address.isDefault && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400">
                                                                <Check size={12} />
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{address.fullName}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{address.street}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {address.city}, {address.state} {address.zipCode}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{address.country}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{address.phone}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {!address.isDefault && (
                                                        <button
                                                            onClick={() => handleSetDefaultAddress(index)}
                                                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                                                            title="Set as default"
                                                        >
                                                            <Check size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleEditAddress(index)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAddress(index)}
                                                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Change Password Tab */}
                    {activeTab === "password" && (
                        <form onSubmit={handlePasswordSubmit}>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Change Password</h2>

                            <div className="mb-4">
                                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                                    required
                                    minLength={6}
                                />
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Must be at least 6 characters long
                                </p>
                            </div>

                            <div className="mb-6">
                                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                                    required
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCurrentPassword("");
                                        setNewPassword("");
                                        setConfirmPassword("");
                                        setError("");
                                    }}
                                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                    disabled={loading}
                                >
                                    Clear
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 rounded-lg bg-black dark:bg-white px-4 py-2.5 text-sm font-medium text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition disabled:opacity-70"
                                    disabled={loading}
                                >
                                    {loading ? "Updating..." : "Update Password"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EditProfile;
