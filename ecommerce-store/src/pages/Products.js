import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getProducts } from "../api/productService";
import { useCart } from "../context/CartContext";
import FilterSidebar from "../components/FilterSidebar";
import QuickViewModal from "../components/QuickViewModal";

function Products() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Quick View State
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAttributes, setSelectedAttributes] = useState({});

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");
        const res = await getProducts();
        setProducts(res.data?.products || []);
      } catch (err) {
        console.error("Products API error:", err.response?.data || err.message || err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set();
    products.forEach(p => {
        if (Array.isArray(p.category)) {
            p.category.forEach(c => {
                if (typeof c === 'object' && c !== null) cats.add(c.name);
                else if (c) cats.add(c);
            });
        } else if (typeof p.category === 'object' && p.category !== null) {
            cats.add(p.category.name);
        } else if (p.category) {
            cats.add(p.category);
        }
    });
    return [...cats];
  }, [products]);

  // Extract product attributes (size, color, etc.)
  const productAttributes = useMemo(() => {
    const attrs = {};
    products.forEach(p => {
      if (Array.isArray(p.attributes)) {
        p.attributes.forEach(attr => {
          if (!attrs[attr.name]) attrs[attr.name] = new Set();
          if (Array.isArray(attr.values)) {
            attr.values.forEach(val => attrs[attr.name].add(val));
          }
        });
      }
    });
    
    // Convert Sets to Arrays
    return Object.entries(attrs).reduce((acc, [key, set]) => {
      acc[key] = Array.from(set);
      return acc;
    }, {});
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesCategory = true;
      if (selectedCategory) {
          if (Array.isArray(p.category)) {
              matchesCategory = p.category.some(c => {
                  const cName = (typeof c === 'object' && c !== null) ? c.name : c;
                  return cName === selectedCategory;
              });
          } else if (typeof p.category === 'object' && p.category !== null) {
              matchesCategory = p.category.name === selectedCategory;
          } else {
              matchesCategory = p.category === selectedCategory;
          }
      }

      // Check if product matches selected attributes
      const matchesAttributes = Object.entries(selectedAttributes).every(([attrName, selectedValues]) => {
        if (!selectedValues || selectedValues.length === 0) return true;
        
        const productAttr = p.attributes?.find(a => a.name === attrName);
        if (!productAttr) return false;
        
        return selectedValues.some(val => productAttr.values?.includes(val));
      });

      return matchesSearch && matchesCategory && matchesAttributes;
    });
  }, [products, searchQuery, selectedCategory, selectedAttributes]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600 dark:text-gray-400">
        Loading products...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500 font-medium">
        {error}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Products
        </h2>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <FilterSidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          attributes={productAttributes}
          selectedAttributes={selectedAttributes}
          onSelectAttribute={(attrName, values) => {
            setSelectedAttributes(prev => ({
              ...prev,
              [attrName]: values
            }));
          }}
        />

        {/* Product Grid */}
        <div className="flex-1">
           {searchQuery && (
             <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
               Showing results for "<span className="font-semibold text-black dark:text-white">{searchQuery}</span>"
             </p>
           )}
           
          {filteredProducts.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No products found.</p>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition hover:shadow-md"
                >
                  <Link to={`/products/${product._id}`}>
                    <div className="relative h-52 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                      {(product.mainImage ||
                        (Array.isArray(product.images) &&
                          product.images.length > 0)) && (
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

                  <div className="flex flex-1 flex-col p-3">
                    <h3 className="mb-1 line-clamp-1 text-sm font-medium text-gray-800 dark:text-gray-200">
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
                        <div className="mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-base font-bold text-black dark:text-white">
                              ₹{displayPrice}
                            </p>
                            {hasSalePrice && numericPrice > 0 && numericSalePrice < numericPrice && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-through">
                                ₹{numericPrice}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    <div className="mt-auto flex gap-2">
                      <Link
                        to={`/products/${product._id}`}
                        className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-center text-xs font-medium text-gray-800 dark:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => {
                            setQuickViewProduct(product);
                            setIsQuickViewOpen(true);
                        }}
                        className="flex-1 rounded-lg bg-black dark:bg-white px-3 py-1.5 text-center text-xs font-medium text-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Quick View Modal */}
      <QuickViewModal 
        product={quickViewProduct} 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
      />
    </div>
  );
}

export default Products;
