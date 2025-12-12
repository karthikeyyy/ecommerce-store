import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const RecentlyViewed = ({ currentProductId }) => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        // Load recent products from local storage
        const loadRecent = () => {
            try {
                const stored = localStorage.getItem("recentlyViewed");
                if (stored) {
                    const parsed = JSON.parse(stored);
                    // Filter out current product to avoid duplication in display
                    const filtered = parsed.filter(p => p._id !== currentProductId);
                    setProducts(filtered);
                }
            } catch (err) {
                console.error("Failed to load recently viewed products", err);
            }
        };

        loadRecent();
    }, [currentProductId]);

    if (products.length === 0) return null;

    return (
        <div className="mt-16 border-t border-gray-100 dark:border-gray-800 pt-8 bg-gray-50/50 dark:bg-gray-900/50 -mx-4 px-4 pb-12">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Recently Viewed
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                    {products.slice(0, 10).map((product) => (
                        <Link
                            key={product._id}
                            to={`/products/${product._id}`}
                            className="group min-w-[160px] w-[160px] snap-start"
                        >
                            <div className="relative aspect-square overflow-hidden rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-3 shadow-sm">
                                {product.images?.[0] ? (
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-gray-400 dark:text-gray-500">
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
                                            <div className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg">
                                                {discountPercent}%
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                            <h3 className="text-xs font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 h-4 leading-tight">
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
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">
                                                ₹{displayPrice}
                                            </p>
                                            {hasSalePrice && numericPrice > 0 && numericSalePrice < numericPrice && (
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 line-through">
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
        </div>
    );
};

export default RecentlyViewed;
