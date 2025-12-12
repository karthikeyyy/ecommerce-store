import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

function Wishlist() {
    const [wishlist, setWishlist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get('/wishlist');
            setWishlist(res.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load wishlist");
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (productId) => {
        try {
            await axiosClient.delete(`/wishlist/${productId}`);
            fetchWishlist(); // Refresh
        } catch (err) {
            console.error(err);
            alert("Failed to remove item");
        }
    };

    if (loading) return <div className="p-10 text-center">Loading wishlist...</div>;
    if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6">My Wishlist</h2>

            {!wishlist || wishlist.products.length === 0 ? (
                <p className="text-gray-500">Your wishlist is empty.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {wishlist.products.map((item) => {
                        const product = item.product;
                        if (!product) return null; // Handle deleted products

                        return (
                            <div key={product._id} className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
                                <Link to={`/products/${product._id}`}>
                                    <div className="relative h-52 w-full overflow-hidden bg-gray-100">
                                        {(product.mainImage || (product.images && product.images.length > 0)) && (
                                            <img
                                                src={product.mainImage || product.images[0]}
                                                alt={product.name}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        )}
                                        {(() => {
                                            const numericPrice = Number(product.price);
                                            const numericSalePrice = Number(product.salePrice);
                                            const hasSalePrice = !isNaN(numericSalePrice) && numericSalePrice > 0 && numericSalePrice < numericPrice;
                                            const discountPercent = hasSalePrice ? Math.round(((numericPrice - numericSalePrice) / numericPrice) * 100) : null;

                                            if (discountPercent && discountPercent > 0) {
                                                return (
                                                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">
                                                        {discountPercent}% OFF
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                </Link>
                                <div className="p-4 flex flex-col flex-1">
                                    <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                                    {(() => {
                                        const numericPrice = Number(product.price);
                                        const numericSalePrice = Number(product.salePrice);
                                        const hasValidBasePrice = !isNaN(numericPrice) && numericPrice > 0;
                                        const hasSalePrice = !isNaN(numericSalePrice) && numericSalePrice > 0 && numericSalePrice < numericPrice;
                                        const displayPrice = hasSalePrice ? numericSalePrice : hasValidBasePrice ? numericPrice : 0;

                                        if (displayPrice <= 0) return null;

                                        return (
                                            <div className="mb-3">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-base font-bold">₹{displayPrice}</p>
                                                    {hasSalePrice && numericPrice > 0 && numericSalePrice < numericPrice && (
                                                        <p className="text-xs text-gray-500 line-through">₹{numericPrice}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                    <button
                                        onClick={() => removeFromWishlist(product._id)}
                                        className="mt-auto w-full py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Wishlist;
