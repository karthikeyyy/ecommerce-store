import React from "react";
import { Edit2, Trash2, CheckSquare, Square } from "lucide-react";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount || 0);

const ProductTableView = ({
  products,
  selectedProducts,
  onSelectProduct,
  onSelectAll,
  onDelete,
  onToggleStatus,
  onEdit,
}) => {
  const allSelected =
    products.length > 0 && selectedProducts.length === products.length;

  const getMainImage = (product) => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }
    if (typeof product.mainImage === "string") return product.mainImage;
    return null;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-sm">
          <tr>
            <th className="py-3 px-4">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectAll();
                }}
                className="hover:bg-gray-200 dark:hover:bg-gray-600 p-1 rounded transition"
                title={
                  allSelected && products.length > 0
                    ? "Deselect All"
                    : "Select All"
                }
              >
                {allSelected ? (
                  <CheckSquare className="w-5 h-5 text-green-600" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>
            </th>
            <th className="py-3 px-4">Product</th>

            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4">Price</th>
            <th className="py-3 px-4">Quantity</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Stock</th>

            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {products.length > 0 ? (
            products.map((product) => {
              const isSelected = selectedProducts.includes(product._id);
              const mainImage = getMainImage(product);
              const price = product.salePrice || product.price || 0;
              const categoryName =
                typeof product.category === "object"
                  ? product.category?.name
                  : product.category;
              return (
                <tr
                  key={product._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProduct(product._id);
                      }}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded transition"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-green-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {mainImage ? (
                        <img
                          src={mainImage}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs text-gray-500">
                          No Img
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-medium">{product.name}</span>
                        {product.brand && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {product.brand}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                    {categoryName || "-"}
                  </td>
                  <td className="py-3 px-4 font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(price)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-200">
                    {product.quantity ?? 0}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() =>
                        onToggleStatus(product._id, product.status)
                      }
                      className={`relative inline-flex h-6 w-20 items-center rounded-full transition-colors text-xs font-medium ${product.status === "Published"
                        ? "bg-green-600 text-white"
                        : "bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100"
                        }`}
                      title={
                        product.status === "Published"
                          ? "Click to mark as Draft"
                          : "Click to mark as Published"
                      }
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${product.status === "Published"
                          ? "translate-x-[52px]"
                          : "translate-x-1"
                          }`}
                      />
                      <span className="absolute left-2">
                        {product.status === "Published" ? "Pub" : "Draft"}
                      </span>
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stockStatus === "In Stock" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"}`}
                    >
                      {product.stockStatus || "In Stock"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onEdit(product._id)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-3 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(product._id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="8" className="py-16 text-center text-gray-500">
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </table >
    </div >
  );
};

export default ProductTableView;
