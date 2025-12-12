import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Link } from "react-router-dom";

const slides = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=2000",
        title: "Elegance Redefined",
        subtitle: "New Luxury Collection",
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1506619216599-9d16d0903dfd?auto=format&fit=crop&q=80&w=2000",
        title: "Urban Minimalism",
        subtitle: "Streetwear Essentials",
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=2000",
        title: "Autumn Layers",
        subtitle: "Cozy & Chic",
    },
];

function Poster() {
    return (
        <section className="relative w-full h-[500px] md:h-[600px] mb-12 rounded-3xl overflow-hidden shadow-2xl">
            <Swiper
                modules={[Autoplay, EffectFade, Navigation, Pagination]}
                effect="fade"
                speed={1000}
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                }}
                pagination={{
                    clickable: true,
                    dynamicBullets: true,
                }}
                navigation={true}
                loop={true}
                className="h-full w-full"
            >
                {slides.map((slide) => (
                    <SwiperSlide key={slide.id} className="relative h-full w-full">
                        <div className="absolute inset-0">
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 md:bg-black/20" />
                        </div>

                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
                            <p className="mb-4 text-sm font-medium tracking-[0.3em] uppercase opacity-0 animate-fadeInUp" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
                                {slide.subtitle}
                            </p>
                            <h2 className="mb-8 text-5xl md:text-7xl font-bold tracking-tight opacity-0 animate-fadeInUp" style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}>
                                {slide.title}
                            </h2>
                            <Link
                                to="/products"
                                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition-transform hover:scale-105 opacity-0 animate-fadeInUp"
                                style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}
                            >
                                <span>Shop Now</span>
                            </Link>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Custom Styles for Swiper Pagination/Navigation if needed in index.css, keeping it default for now but styled via tailwind parent */}
            <style>{`
        .swiper-button-next, .swiper-button-prev {
          color: white !important; 
          transform: scale(0.7);
        }
        .swiper-pagination-bullet-active {
            background-color: white !important;
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
            animation-name: fadeInUp;
            animation-duration: 0.8s;
        }
      `}</style>
        </section>
    );
}

export default Poster;
