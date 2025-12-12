import React from "react";
import { Link } from "react-router-dom";

function Hero() {
    return (
        <section className="mb-12">
            <div className="grid gap-4 md:grid-cols-4 md:grid-rows-2 md:h-[500px]">
                {/* Main Hero Card - Spans 2 cols, 2 rows */}
                <div className="group relative overflow-hidden rounded-3xl bg-gray-100 md:col-span-2 md:row-span-2">
                    <img
                        src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1000"
                        alt="Women Fashion"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                        <h2 className="text-3xl font-bold text-white md:text-4xl">
                            Summer Collection '25
                        </h2>
                        <p className="mt-2 max-w-sm text-gray-200">
                            Discover the latest trends in sustainable fashion. Elevate your wardrobe with our premium selection.
                        </p>
                        <Link
                            to="/products?category=Women's Clothing"
                            className="mt-6 inline-flex w-fit items-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-100"
                        >
                            Shop Collection &rarr;
                        </Link>
                    </div>
                </div>

                {/* Top Right - Men/Unisex */}
                <div className="group relative overflow-hidden rounded-3xl bg-gray-100 md:col-span-2 md:row-span-1">
                    <img
                        src="https://images.unsplash.com/photo-1492446845049-9c50cc313f00?auto=format&fit=crop&q=80&w=800"
                        alt="Men Fashion"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30 transition group-hover:bg-black/40 flex items-center justify-center">
                        <Link to="/products?category=Men's Clothing" className="rounded-full backdrop-blur-md bg-white/30 border border-white/50 px-6 py-2 text-white font-semibold hover:bg-white hover:text-black transition">
                            Men's Essentials
                        </Link>
                    </div>
                </div>

                {/* Bottom Right 1 - Accessories */}
                <div className="group relative overflow-hidden rounded-3xl bg-gray-100 md:col-span-1 md:row-span-1">
                    <img
                        src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600"
                        alt="Accessories"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute bottom-4 left-4">
                        <Link to="/products?category=Accessories" className="inline-block px-3 py-1 rounded-full bg-white text-xs font-bold text-black shadow-sm">
                            Accessories
                        </Link>
                    </div>
                </div>

                {/* Bottom Right 2 - New Drop */}
                <div className="group relative overflow-hidden rounded-3xl bg-emerald-900 md:col-span-1 md:row-span-1 flex items-center justify-center p-6 text-center">
                    <div className="relative z-10">
                        <p className="text-emerald-200 text-xs font-bold tracking-widest uppercase mb-1">New Drop</p>
                        <h3 className="text-2xl font-bold text-white mb-3">Urban<br />Streetwear</h3>
                        <Link to="/products?category=Men's Clothing" className="text-sm text-white underline underline-offset-4 hover:text-emerald-200">
                            Explore
                        </Link>
                    </div>
                    {/* Decorative circle */}
                    <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-500/20 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-emerald-500/10 blur-xl"></div>
                </div>
            </div>
        </section>
    );
}

export default Hero;
