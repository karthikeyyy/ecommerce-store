import React, { useState, useEffect } from "react";
import { X, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";

const QuickViewModal = ({ product, isOpen, onClose }) => {
    const { addToCart } = useCart();
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [validationError, setValidationError] = useState("");

    // Reset state when product opens
    useEffect(() => {
        if (product) {
            const initialSelection = {};
            if (product.attributes && Array.isArray(product.attributes)) {
                product.attributes.forEach((attr) => {
                    if (attr.values && attr.values.length === 1) {
                        initialSelection[attr.name] = attr.values[0];
                    }
                });
            }
            setSelectedAttributes(initialSelection);
            setValidationError("");
        }
    }, [product, isOpen]);

    if (!isOpen || !product) return null;

    const handleAttributeSelect = (name, value) => {
        setSelectedAttributes((prev) => ({ ...prev, [name]: value }));
        setValidationError("");
    };

    const handleAddToCart = () => {
        // Validate attributes
        if (product.attributes && product.attributes.length > 0) {
            for (const attr of product.attributes) {
                if (attr.values && attr.values.length > 0) {
                    if (!selectedAttributes[attr.name]) {
                        setValidationError(`Please select ${attr.name}`);
                        return;
                    }
                }
            }
        }

        addToCart(
            {
                ...product,
                selectedAttributes,
            },
            1
        );
        onClose();
    };

    const mainImage =
        product.mainImage ||
        (Array.isArray(product.images) && product.images.length > 0
            ? product.images[0]
            : "");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-xl animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Image */}
                    <div className="aspect-square bg-gray-100 dark:bg-slate-800">
                        {mainImage ? (
                            <img
                                src={mainImage}
                                alt={product.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-gray-400">
                                No Image
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-col p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {product.name}
                        </h2>
                        {(() => {
                            const numericPrice = Number(product.price);
                            const numericSalePrice = Number(product.salePrice);
                            const hasValidBasePrice = !isNaN(numericPrice) && numericPrice > 0;
                            const hasSalePrice = !isNaN(numericSalePrice) && numericSalePrice > 0 && numericSalePrice < numericPrice;
                            const displayPrice = hasSalePrice ? numericSalePrice : hasValidBasePrice ? numericPrice : 0;
                            const discountPercent = hasSalePrice ? Math.round(((numericPrice - numericSalePrice) / numericPrice) * 100) : null;

                            if (displayPrice <= 0) return null;

                            return (
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                        ₹{displayPrice}
                                    </span>
                                    {hasSalePrice && numericPrice > 0 && numericSalePrice < numericPrice && (
                                        <span className="text-sm text-gray-500 line-through">
                                            ₹{numericPrice}
                                        </span>
                                    )}
                                    {discountPercent && discountPercent > 0 && (
                                        <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                            {discountPercent}% OFF
                                        </span>
                                    )}
                                </div>
                            );
                        })()}

                        {/* Attributes */}
                        {product.attributes && product.attributes.length > 0 && (
                            <div className="mt-6 space-y-4">
                                {product.attributes.map((attr) => (
                                    attr.values && attr.values.length > 0 && (
                                        <div key={attr.name}>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {attr.name}
                                            </span>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {attr.values.map((val) => (
                                                    <button
                                                        key={val}
                                                        onClick={() => handleAttributeSelect(attr.name, val)}
                                                        className={`rounded-md border px-3 py-1 text-sm transition-all ${selectedAttributes[attr.name] === val
                                                            ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                                                            : "border-gray-200 hover:border-black dark:border-slate-700 dark:text-slate-300 dark:hover:border-white"
                                                            }`}
                                                    >
                                                        {val}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        )}

                        {validationError && (
                            <p className="mt-4 text-sm font-medium text-red-500">
                                {validationError}
                            </p>
                        )}

                        <div className="mt-auto pt-6">
                            <button
                                onClick={handleAddToCart}
                                className="flex w-full items-center justify-center gap-2 rounded-full bg-black py-3 text-sm font-bold text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100"
                            >
                                <ShoppingBag className="h-4 w-4" />
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickViewModal;
