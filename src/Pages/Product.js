import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Layout/Header";
import Footer from "../Components/Layout/Footer";
import { apiRequest } from "../api/api";
import {
  Search,
  Grid3x3,
  List,
  Plus,
} from "lucide-react";
import ProductTableView from "../Components/ProductTableView";
import ProductGridView from "../Components/ProductGridView";

const Product = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await apiRequest("/products");
      // Adjusted to match API response structure
      setProducts(res.products || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const normalizedString = (val) =>
    (val || "").toString().toLowerCase().trim();

  const filteredProducts = products.filter((p) => {
    const s = normalizedString(searchTerm);
    if (!s) return true;
    const name = normalizedString(p.name);
    const sku = normalizedString(p.sku);
    const brand = normalizedString(p.brand);
    const categoryName = normalizedString(
      typeof p.category === "object" ? p.category?.name : p.category
    );
    return (
      name.includes(s) ||
      sku.includes(s) ||
      brand.includes(s) ||
      categoryName.includes(s)
    );
  });

  const handleSelectProduct = (id) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter((pid) => pid !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  const handleSelectAll = () => {
    if (
      selectedProducts.length === filteredProducts.length &&
      filteredProducts.length > 0
    ) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p._id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedProducts.length} products?`
      )
    )
      return;

    try {
      await apiRequest("/products/bulk-delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedProducts }),
      });
      await fetchProducts();
      setSelectedProducts([]);
    } catch (error) {
      console.error("Error bulk deleting products:", error);
    }
  };

  const handleBulkUpdateStatus = async (status) => {
    if (selectedProducts.length === 0) return;

    try {
      await apiRequest("/products/bulk-status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedProducts, status }),
      });
      await fetchProducts();
      setSelectedProducts([]);
    } catch (error) {
      console.error("Error bulk updating product status:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await apiRequest(`/products/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      await fetchProducts();
      setSelectedProducts(selectedProducts.filter((pid) => pid !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "Published" ? "Draft" : "Published";
    try {
      await apiRequest(`/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      await fetchProducts();
    } catch (error) {
      console.error("Error toggling product status:", error);
    }
  };

  const handleEditProduct = (id) => {
    navigate(`/edit-product/${id}`);
  };

  const clearSelection = () => {
    setSelectedProducts([]);
  };

  return (
    <React.Fragment>
      <div className="flex bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen">
        <Sidebar />
        <div className="flex-1 overflow-x-hidden p-4 flex flex-col">
          <Header />

          <div className="flex flex-col md:flex-row items-center justify-between mt-6 mb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Products</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage your product catalog
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div className="flex bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-l-lg transition ${
                    viewMode === "table"
                      ? "bg-green-600 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  title="Table View"
                >
                  <List className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-r-lg transition ${
                    viewMode === "grid"
                      ? "bg-green-600 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  title="Grid View"
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => navigate("/add-product")}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow transition whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </button>
            </div>
          </div>

          {selectedProducts.length > 0 && (
            <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {selectedProducts.length} products selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkUpdateStatus("Published")}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition"
                >
                  Mark Published
                </button>
                <button
                  onClick={() => handleBulkUpdateStatus("Draft")}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition"
                >
                  Mark Draft
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition"
                >
                  Delete Selected
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          <div className="flex-1">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                Loading products...
              </div>
            ) : viewMode === "grid" ? (
              <ProductGridView
                products={filteredProducts}
                selectedProducts={selectedProducts}
                onSelectProduct={handleSelectProduct}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                onEdit={handleEditProduct}
              />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <ProductTableView
                  products={filteredProducts}
                  selectedProducts={selectedProducts}
                  onSelectProduct={handleSelectProduct}
                  onSelectAll={handleSelectAll}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                  onEdit={handleEditProduct}
                />
              </div>
            )}
          </div>

          <Footer />
        </div>
      </div>
    </React.Fragment>
  );
};

export default Product;
