import React from "react";
import {
  Edit2,
  Trash2,
  CheckSquare,
  Square,
  Package,
  DollarSign,
  Tag,
  AlertCircle,
} from "lucide-react";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount || 0);

const ProductGridView = ({
  products,
  selectedProducts,
  onSelectProduct,
  onDelete,
  onToggleStatus,
  onEdit,
}) => {
  const getMainImage = (product) => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }
    if (typeof product.mainImage === "string") return product.mainImage;
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.length > 0 ? (
        products.map((product) => {
          const isSelected = selectedProducts.includes(product._id);
          const mainImage = getMainImage(product);
          const price = product.salePrice || product.price || 0;
          const categoryName =
            typeof product.category === "object"
              ? product.category?.name
              : product.category;
          const discount =
            typeof product.discount === "number" ? product.discount : null;

          return (
            <div
              key={product._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <button
                    onClick={() => onSelectProduct(product._id)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-green-600" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                  <div className="flex items-center gap-2">
                    {product.status === "Published" ? (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                        Published
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                        Draft
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${product.stockStatus === "Out of Stock"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200"
                        }`}
                    >
                      {product.stockStatus || "In Stock"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center mb-4">
                  {mainImage ? (
                    <img
                      src={mainImage}
                      alt={product.name}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                      <Package className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-center mb-1 text-gray-800 dark:text-white">
                  {product.name}
                </h3>
                {product.brand && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">
                    {product.brand}
                  </p>
                )}

                {categoryName && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-4">
                    {categoryName}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Price
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-800 dark:text-white">
                      {formatCurrency(price)}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Stock
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-800 dark:text-white">
                      {product.quantity ?? 0}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Tag className="w-4 h-4 text-purple-500" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Discount
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-800 dark:text-white">
                      {discount ? `${discount}%` : "–"}
                    </p>
                  </div>


                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(product._id)}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(product._id)}
                    className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="col-span-full py-16 text-center text-gray-500">
          No products found.
        </div>
      )}
    </div>
  );
};

export default ProductGridView;
