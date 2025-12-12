import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { getProducts } from "../services/productService";

const DashboardInventorySlider = () => {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    const res = await getProducts();
    // Sort by createdAt descending (newest first)
    const sorted = res.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setProducts(sorted);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getStockStatus = (qty) => {
    if (qty === 0) return <span className="text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400 px-2 py-0.5 rounded-full uppercase tracking-wide">Out of Stock</span>;
    if (qty < 5) return <span className="text-[10px] font-bold bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 px-2 py-0.5 rounded-full uppercase tracking-wide">Low Stock</span>;
    return <span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wide">In Stock</span>;
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm w-full overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Inventory Overview</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">Recent products and stock status</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
          No products added yet.
        </div>
      ) : (
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          spaceBetween={24}
          breakpoints={{
            1280: { slidesPerView: 5 },
            1024: { slidesPerView: 4 },
            768: { slidesPerView: 3 },
            640: { slidesPerView: 2 },
            0: { slidesPerView: 1 }
          }}
          className="pb-16"
        >
          {products.map((product) => (
            <SwiperSlide key={product._id}>
              <div className="bg-white dark:bg-slate-950/40 border border-gray-200 dark:border-slate-800 rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-300 group h-full">
                <div className="relative overflow-hidden rounded-lg aspect-square mb-3 bg-gray-100 dark:bg-slate-900">
                  <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2">
                    {getStockStatus(product.quantity)}
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 mb-1" title={product.name}>
                  {product.name}
                </h3>

                <div className="flex items-center justify-between mt-2">
                  <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    ₹{product.price}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                    Qty: {product.quantity}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};

export default DashboardInventorySlider;
