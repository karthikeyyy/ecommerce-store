import React from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Eye } from "lucide-react";

const StarRating = ({ rating = 4 }) => {
  const fullStars = Math.floor(rating);
  const emptyStars = 5 - fullStars;

  return (
    <div className="flex items-center text-yellow-500">
      {Array.from({ length: fullStars }).map((_, i) => <span key={i}>★</span>)}
      {Array.from({ length: emptyStars }).map((_, i) => <span key={i}>☆</span>)}
    </div>
  );
};

const TopSellingList = ({ products = [] }) => {
  const navigate = useNavigate();
  // Removed internal state and fetch logic to use props passed from Dashboard

  return (
    <div className="p-6 w-full bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Recently Added Products
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">Latest additions to your store</p>
        </div>

        <button
          onClick={() => navigate('/product')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 
        text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all text-sm font-medium shrink-0">
          <Eye size={16} />
          View All
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto overflow-x-hidden pr-2">
        {products.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
            No products added yet.
          </div>
        ) : (
          <ul className="space-y-3">
            {products.map((product) => (
              <li
                key={product._id}
                className="flex items-center bg-gray-50 dark:bg-slate-950/40 border border-gray-200 dark:border-slate-800 
                rounded-xl p-3 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800 transition-all group"
              >
                <div className="relative shrink-0">
                  <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-slate-700"
                  />
                </div>

                <div className="flex-1 ml-4 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm mt-1">₹{product.price}</p>
                  <StarRating rating={4} />
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-sm">
                    <Pencil size={14} />
                  </button>

                  <button className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all shadow-sm">
                    <Trash2 size={14} />
                  </button>
                </div>

              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TopSellingList;
