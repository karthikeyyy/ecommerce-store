import React, { useEffect, useMemo, useState } from "react";
import {
  MessagesSquare,
  Star,
  CheckCircle,
  Filter,
  Trash2,
  Loader2,
} from "lucide-react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Layout/Header";
import Footer from "../Components/Layout/Footer";
import axiosClient from "../api/axiosClient";

const Reviews = () => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      setLoading(true);
      setError("");
      const res = await axiosClient.get("/reviews");
      setReviews(res.data || []);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteReview(reviewId) {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      await axiosClient.delete(`/reviews/${reviewId}`);
      setReviews(reviews.filter(r => r._id !== reviewId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete review");
    }
  }

  // Calculate days since review was created
  function getDaysSince(dateString) {
    const created = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  const filteredReviews = useMemo(() => {
    if (filterStatus === "recent") {
      return reviews.filter((r) => getDaysSince(r.createdAt) <= 7);
    }
    if (filterStatus === "high") {
      return reviews.filter((r) => r.rating >= 4);
    }
    if (filterStatus === "low") {
      return reviews.filter((r) => r.rating <= 2);
    }
    return reviews;
  }, [filterStatus, reviews]);

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const StarRow = ({ rating }) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? "fill-amber-400" : "fill-transparent"
              }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Header />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
                  <MessagesSquare className="w-7 h-7 text-emerald-500" />
                  Customer Reviews
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  See what customers are saying about your products.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-slate-400">
                    Average Rating
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xl font-semibold">
                      {averageRating.toFixed(1)}
                    </span>
                    <StarRow rating={Math.round(averageRating)} />
                  </div>
                  <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                    Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-slate-200">
                  Filter:
                </span>
                <div className="flex gap-1">
                  <FilterChip
                    label="All"
                    active={filterStatus === "all"}
                    onClick={() => setFilterStatus("all")}
                  />
                  <FilterChip
                    label="Recent 7 days"
                    active={filterStatus === "recent"}
                    onClick={() => setFilterStatus("recent")}
                  />
                  <FilterChip
                    label="4+ Stars"
                    active={filterStatus === "high"}
                    onClick={() => setFilterStatus("high")}
                  />
                  <FilterChip
                    label="1-2 Stars"
                    active={filterStatus === "low"}
                    onClick={() => setFilterStatus("low")}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 dark:text-slate-500">
                Showing {filteredReviews.length} review
                {filteredReviews.length !== 1 ? "s" : ""} out of{" "}
                {reviews.length}.
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredReviews.map((review) => (
                  <div
                    key={review._id}
                    className="flex flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                          {review.user?.name?.charAt(0) || "U"}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                            {review.user?.name || "Anonymous"}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-slate-500">
                            {review.user?.email || "No email"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[0.65rem] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                          title="Delete review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wide text-gray-400 dark:text-slate-500">
                          Product
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-slate-100 line-clamp-1">
                          {review.product?.name || "Unknown Product"}
                        </span>
                        {review.product?.sku && (
                          <span className="text-[0.65rem] text-gray-400 dark:text-slate-500">
                            SKU: {review.product.sku}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <StarRow rating={review.rating} />
                        <span className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <p className="mt-3 text-xs md:text-sm text-gray-700 dark:text-slate-200 line-clamp-4">
                      {review.comment}
                    </p>
                  </div>
                ))}

                {filteredReviews.length === 0 && (
                  <div className="col-span-full rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400">
                    No reviews match this filter yet.
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

const FilterChip = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full px-3 py-1 text-[0.65rem] font-medium transition ${active
        ? "bg-emerald-500 text-white dark:bg-emerald-500"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      }`}
  >
    {label}
  </button>
);

export default Reviews;
