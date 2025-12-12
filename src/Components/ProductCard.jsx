import React from "react";
import { Link } from "react-router-dom";

export default function ProductCard({ product }){
  return (
    <div className="border p-3 rounded">
      <img src={product.images?.[0] || "/placeholder.png"} alt={product.title} className="h-48 w-full object-cover mb-2"/>
      <h3 className="font-medium">{product.title}</h3>
      <p className="text-sm">{product.price} ₹</p>
      <Link to={`/product/${product._id}`} className="inline-block mt-2 text-sm text-blue-600">View</Link>
    </div>
  );
}
