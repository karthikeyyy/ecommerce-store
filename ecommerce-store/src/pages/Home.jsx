import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../api/productService";
import { useCart } from "../context/CartContext";
import BlogSlider from "../components/BlogSlider";
import Hero from "../components/Hero";
import Poster from "../components/Poster";
import QuickViewModal from "../components/QuickViewModal";

function Home() {
  const { addToCart } = useCart();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick View State
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        setLoading(true);
        const res = await getProducts();
        const products = res.data?.products || [];
        setFeatured(products.slice(0, 4));
      } catch (err) {
        setFeatured([]);
      } finally {
        setLoading(false);
      }
    }

    fetchFeatured();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Poster Slider */}
      <Poster />

      {/* Hero */}
      <Hero />

      <section className="mt-10">
        <BlogSlider />
      </section>

      {/* Featured products */}
      <section id="featured" className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
            Featured products
          </h2>
          <Link
            to="/products"
            className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            View all
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading featured products...</p>
        ) : featured.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No featured products yet. Add some products in your admin panel.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
            {featured.map((product) => (
              <div
                key={product._id}
                className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition hover:shadow-md"
              >
                <Link to={`/products/${product._id}`}>
                  <div className="relative h-44 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
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
                            <p className="text-xs text-gray-500 line-through">
                              ₹{numericPrice}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                  <div className="mt-auto flex gap-2">
                    <button
                      onClick={() => {
                        setQuickViewProduct(product);
                        setIsQuickViewOpen(true);
                      }}
                      className="w-full rounded-lg bg-black dark:bg-white px-3 py-1.5 text-xs font-medium text-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100"
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </div>
  );
}

export default Home;
