import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, deleteProduct } from "../services/productService";
import { List, Grid3x3 } from "lucide-react";

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); 
  const navigate = useNavigate();

  const fetchProducts = async () => {
    const res = await getProducts();
    setProducts(res);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    await deleteProduct(id);
    fetchProducts();
  };

  const handleEdit = (id) => {
    navigate(`/edit-product/${id}`);
  };

  return (
    <div className="p-4">
      {products.length === 0 ? (
        <p className="text-gray-500 text-lg">No products added yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border dark:border-gray-700"
            >
              <img
                src={product.images?.[0]}
                alt={product.name}
                className="w-full h-40 object-cover rounded-xl"
              />

              <h2 className="mt-3 text-xl font-semibold">{product.name}</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Price: <b>₹{product.price}</b>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Brand: {product.brand}</p>
              {product.category && product.category.length > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {Array.isArray(product.category)
                    ? product.category.map(cat => cat.name || cat).join(", ")
                    : product.category.name || product.category}
                </p>
              )}
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={() => handleEdit(product._id)}
                  className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(product._id)}
                  className="px-4 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsList;
