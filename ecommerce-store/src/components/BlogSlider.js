import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { getBlogs } from "../api/blogService";

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, "");
}

function BlogSlider() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await getBlogs();
        const data = res.data;

        let list = [];
        if (data?.success && Array.isArray(data.blogs)) list = data.blogs;
        else if (Array.isArray(data)) list = data;
        else if (Array.isArray(data?.data)) list = data.data;

        list = list.filter((b) => !b.status || b.status === "Published");

        setBlogs(list);
      } finally {
        setLoading(false);
      }
    }

    fetchBlogs();
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-500">Loading blog section...</p>;
  }

  if (!blogs.length) {
    return <p className="text-sm text-gray-500">No blogs available.</p>;
  }

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-gray-900">
          From the blog
        </h2>
        <span className="text-xs font-medium text-gray-600">
          Auto sliding every 10s
        </span>
      </div>

      <Swiper
        modules={[Pagination, Autoplay]}
        slidesPerView={1}
        pagination={{ clickable: true }}
        autoplay={{
          delay: 10000,
          disableOnInteraction: false,
        }}
        loop={blogs.length > 1}
        className="rounded-3xl overflow-hidden"
      >
        {blogs.map((blog) => {
          const text = stripHtml(blog.summary || blog.content || "");
          const shortText =
            text.length > 180 ? text.slice(0, 180).trim() + "..." : text;

          return (
            <SwiperSlide key={blog._id}>
              <Link to={`/blog/${blog._id}`} className="block relative">
                {/* FULL SECTION IMAGE */}
                <div className="relative h-80 w-full md:h-96">
                  {blog.featuredImage ? (
                    <img
                      src={blog.featuredImage}
                      alt={blog.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}

                  {/* GRADIENT OVERLAY */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                  {/* TEXT OVER IMAGE */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                    <h3 className="text-xl md:text-2xl font-semibold text-white mb-3 leading-snug line-clamp-2">
                      {blog.title}
                    </h3>
                    {shortText && (
                      <p className="text-sm md:text-base text-gray-200 line-clamp-3 max-w-2xl">
                        {shortText}
                      </p>
                    )}

                    <span className="mt-4 inline-block text-sm font-medium text-white underline-offset-2 hover:underline">
                      Read more →
                    </span>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}

export default BlogSlider;
