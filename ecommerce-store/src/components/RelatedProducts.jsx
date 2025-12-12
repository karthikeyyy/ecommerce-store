import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const RelatedProducts = ({ productId, categoryId }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRelated = async () => {
            try {
                // Using axiosClient instead of raw axios
                const res = await axiosClient.get(`/recommendations/related/${productId}`);
                if (res.data.success) {
                    setProducts(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch related products:", error);
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchRelated();
        }
    }, [productId]);

    if (loading || products.length === 0) return null;

    return (
        <div className="mt-16">
            <div className="flex items-center justify-between mb-8 border-l-4 border-black pl-4">
                <h2 className="text-2xl font-bold text-gray-900">
                    You Might Also Like
                </h2>
                {categoryId && (
                    <Link
                        to={`/products?category=${categoryId}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                        View All
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </Link>
                )}
            </div>

            {/* Slider Container */}
            <div className="-mx-4 px-4 overflow-x-auto pb-6 scrollbar-hide snap-x flex gap-6">
                {products.map((product) => (
                    <Link
                        key={product._id}
                        to={`/products/${product._id}`}
                        className="group min-w-[calc(50%-12px)] md:min-w-[calc(25%-18px)] snap-start"
                    >
                        <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 mb-4">
                            {product.images?.[0] ? (
                                <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-gray-400">
                                    No Image
                                </div>
                            )}
                            {(() => {
                                const numericPrice = Number(product.price);
                                const numericSalePrice = Number(product.salePrice);
                                const hasSalePrice = !isNaN(numericSalePrice) && numericSalePrice > 0 && numericSalePrice < numericPrice;
                                const discountPercent = hasSalePrice ? Math.round(((numericPrice - numericSalePrice) / numericPrice) * 100) : null;

                                if (discountPercent && discountPercent > 0) {
                                    return (
                                        <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-1 rounded-md shadow-lg">
                                            {discountPercent}% OFF
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-600 line-clamp-1">
                            {product.name}
                        </h3>
                        {(() => {
                            const numericPrice = Number(product.price);
                            const numericSalePrice = Number(product.salePrice);
                            const hasValidBasePrice = !isNaN(numericPrice) && numericPrice > 0;
                            const hasSalePrice = !isNaN(numericSalePrice) && numericSalePrice > 0 && numericSalePrice < numericPrice;
                            const displayPrice = hasSalePrice ? numericSalePrice : hasValidBasePrice ? numericPrice : 0;

                            if (displayPrice <= 0) return null;

                            return (
                                <div className="mt-2">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <p className="text-sm font-bold text-gray-900">
                                            ₹{displayPrice}
                                        </p>
                                        {hasSalePrice && numericPrice > 0 && numericSalePrice < numericPrice && (
                                            <p className="text-xs text-gray-500 line-through">
                                                ₹{numericPrice}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RelatedProducts;
