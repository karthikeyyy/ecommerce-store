import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProductById } from "../api/productService";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import axiosClient from "../api/axiosClient";
import RelatedProducts from "../components/RelatedProducts";
import RecentlyViewed from "../components/RecentlyViewed";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError("");
        const res = await getProductById(id);
        const p = res.data?.product || null;
        setProduct(p);

        if (p) {
          const main =
            p.mainImage ||
            (Array.isArray(p.images) && p.images.length > 0 && p.images[0]) ||
            "";
          setActiveImage(main);
          saveToRecentlyViewed(p);

          const initialSelection = {};
          if (p.attributes && Array.isArray(p.attributes)) {
            p.attributes.forEach((attr) => {
              if (attr.values && attr.values.length === 1) {
                initialSelection[attr.name] = attr.values[0];
              }
            });
          }
          setSelectedAttributes(initialSelection);
        }
      } catch (err) {
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    async function fetchReviews() {
      try {
        const res = await axiosClient.get(`/reviews/product/${id}`);
        setReviews(res.data);
      } catch (err) {
        console.error("Failed to fetch reviews", err);
      }
    }

    fetchProduct();
    fetchReviews();
  }, [id]);

  const saveToRecentlyViewed = (product) => {
    try {
      let recent = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
      recent = recent.filter((p) => p._id !== product._id);
      recent.unshift({
        _id: product._id,
        name: product.name,
        price: product.price,
        salePrice: product.salePrice,
        images: product.images,
        slug: product.slug,
      });
      if (recent.length > 10) recent = recent.slice(0, 10);
      localStorage.setItem("recentlyViewed", JSON.stringify(recent));
    } catch (err) {
      console.error("Failed to save recently viewed", err);
    }
  };

  async function handleAddToWishlist() {
    try {
      setWishlistLoading(true);
      await axiosClient.post("/wishlist", { productId: id });
      alert("Added to Wishlist!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add to wishlist");
    } finally {
      setWishlistLoading(false);
    }
  }

  async function handleSubmitReview(e) {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    try {
      await axiosClient.post("/reviews", {
        productId: id,
        rating,
        comment,
      });
      setComment("");
      setRating(5);
      setReviewError("");
      const res = await axiosClient.get(`/reviews/product/${id}`);
      setReviews(res.data);
    } catch (err) {
      setReviewError(err.response?.data?.message || "Failed to submit review");
    }
  }

  function handleAttributeSelect(attributeName, value) {
    setSelectedAttributes((prev) => ({ ...prev, [attributeName]: value }));
    if (validationErrors.includes(attributeName)) {
      setValidationErrors((prev) => prev.filter((e) => e !== attributeName));
    }
  }

  function handleAddToCart() {
    if (!product) return;
    const errors = [];
    if (product.attributes && product.attributes.length > 0) {
      product.attributes.forEach((attr) => {
        if (attr.values && attr.values.length > 0) {
          if (!selectedAttributes[attr.name]) {
            errors.push(attr.name);
          }
        }
      });
    }
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    addToCart(
      {
        ...product,
        selectedAttributes,
      },
      1
    );
  }

  if (loading) return <div className="p-6 text-center text-gray-600">Loading product...</div>;
  if (error) return <div className="p-6 text-center text-red-500 font-medium">{error}</div>;
  if (!product) return <div className="p-6 text-center text-gray-600">Product not found</div>;

  const allImages = [...(product.mainImage ? [product.mainImage] : []), ...(Array.isArray(product.images) ? product.images : [])];

  const LoginModal = () => {
    if (!showLoginModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowLoginModal(false)}>
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-4">
              <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h3>
            <p className="text-gray-600 mb-6">Please login to write a review for this product.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLoginModal(false)} className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition">Cancel</button>
              <button onClick={() => { setShowLoginModal(false); navigate("/login", { state: { from: `/product/${id}` } }); }} className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition">Login Now</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const numericPrice = Number(product.price);
  const numericSalePrice = Number(product.salePrice);
  const hasValidBasePrice = !isNaN(numericPrice) && numericPrice > 0;
  const hasSalePrice = !isNaN(numericSalePrice) && numericSalePrice > 0 && numericSalePrice < numericPrice;
  const displayPrice = hasSalePrice ? numericSalePrice : hasValidBasePrice ? numericPrice : 0;
  const discountPercent = hasSalePrice ? Math.round(((numericPrice - numericSalePrice) / numericPrice) * 100) : null;

  return (
    <>
      <LoginModal />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <div className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
              {activeImage ? (
                <img src={activeImage} alt={product.name} className="h-[360px] w-full object-cover md:h-[420px]" />
              ) : (
                <div className="flex h-[360px] items-center justify-center text-sm text-gray-400 md:h-[420px]">No image</div>
              )}
            </div>

            {allImages.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {allImages.map((img, index) => (
                  <button key={index} type="button" onClick={() => setActiveImage(img)} className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border ${activeImage === img ? "border-black" : "border-gray-200 hover:border-gray-300"}`}>
                    <img src={img} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">{product.name}</h1>
            </div>

            <div className="flex items-end gap-3">
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">₹{displayPrice}</div>
              {hasSalePrice && numericPrice > 0 && numericSalePrice < numericPrice && (
                <div className="text-sm text-gray-400 dark:text-gray-500 line-through">₹{numericPrice}</div>
              )}
              {discountPercent && discountPercent > 0 && (
                <div className="rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-xs font-semibold text-green-700 dark:text-green-400">{discountPercent}% OFF</div>
              )}
            </div>

            {product.shortDescription || product.description ? (
              <p className="text-sm text-gray-600 dark:text-gray-300">{product.shortDescription || product.description}</p>
            ) : null}

            {product.attributes && product.attributes.length > 0 && (
              <div className="mt-2 space-y-4">
                {product.attributes.map((attr, idx) => (
                  attr.values && attr.values.length > 0 && (
                    <div key={idx} className={`rounded-xl p-3 transition-colors ${validationErrors.includes(attr.name) ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800" : ""}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`text-sm font-medium ${validationErrors.includes(attr.name) ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>{attr.name} {validationErrors.includes(attr.name) && <span className="text-xs font-normal ml-2">(Please select)</span>}</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {attr.values.map((val) => {
                          const isSelected = selectedAttributes[attr.name] === val;
                          return (
                            <button key={val} onClick={() => handleAttributeSelect(attr.name, val)} className={`px-4 py-2 text-sm border rounded-md focus:outline-none transition-all ${isSelected ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black" : "border-gray-300 dark:border-gray-600 hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"}`}>
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}

            <div className="mt-2">
              {(() => {
                const stock = product.stock > 0 ? product.stock : (product.quantity || 0);
                let statusText = "Out of Stock";
                let statusClass = "text-red-600 bg-red-100";
                
                if (stock > 0 && stock < 20) {
                  statusText = "Low Stock";
                  statusClass = "text-amber-700 bg-amber-100";
                } else if (stock >= 20) {
                  statusText = "In Stock";
                  statusClass = "text-green-700 bg-green-100";
                }
                
                return (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Availability:{" "}
                    <span className={`font-semibold px-3 py-1 rounded-full text-xs ${statusClass}`}>
                      {statusText}
                    </span>
                  </p>
                );
              })()}
            </div>

            <div className="mt-4 flex gap-3">
              <button onClick={handleAddToCart} disabled={(product.stock > 0 ? product.stock : (product.quantity || 0)) <= 0} className={`flex-1 rounded-full px-6 py-3 text-sm font-medium text-white shadow-sm transition ${(product.stock > 0 ? product.stock : (product.quantity || 0)) <= 0 ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100"}`}>{(product.stock > 0 ? product.stock : (product.quantity || 0)) <= 0 ? "Out of Stock" : "Add to Cart"}</button>
              <button onClick={handleAddToWishlist} disabled={wishlistLoading} className="rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-500 dark:text-gray-300 transition hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-500 dark:hover:text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>
            </div>

            {product.description && (
              <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h2 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Product details</h2>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-line">{product.description}</p>
              </div>
            )}

            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reviews ({reviews.length})</h2>

              <div className="mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                <h3 className="text-sm font-medium mb-2 dark:text-white">Write a Review</h3>
                <form onSubmit={handleSubmitReview} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Rating</label>
                    <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="block w-full mt-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-2 text-sm">
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Very Good</option>
                      <option value="3">3 - Good</option>
                      <option value="2">2 - Fair</option>
                      <option value="1">1 - Poor</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Comment</label>
                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} required rows="2" className="block w-full mt-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-2 text-sm" placeholder="Share your thoughts..." />
                  </div>
                  {reviewError && <p className="text-xs text-red-500">{reviewError}</p>}
                  <button className="text-xs bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100">Submit Review</button>
                </form>
              </div>

              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No reviews yet. Be the first to review!</p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev._id} className="border-b border-gray-100 dark:border-gray-800 pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-gray-900 dark:text-white">{rev.user?.name || "User"}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center mb-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-3 h-3 ${i < rev.rating ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <RelatedProducts productId={id} categoryId={product?.category?.[0]?._id || product?.category?.[0]} />
        <RecentlyViewed currentProductId={id} />
      </div>
    </>
  );
}

export default ProductDetail;
