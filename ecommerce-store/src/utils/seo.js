import React from "react";
import { Helmet } from "react-helmet-async";

export const SEO = ({
  title = "E-commerce Store",
  description = "Your one-stop shop for quality products",
  keywords = "ecommerce, shop, products, online store",
  image = "/og-image.jpg",
  url = window.location.href,
  type = "website",
}) => {
  const siteTitle = "My E-commerce Store";
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Additional SEO */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

// Product SEO with structured data
export const ProductSEO = ({ product }) => {
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.images || [],
    description: product.description,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: product.brand || "Store Brand",
    },
    offers: {
      "@type": "Offer",
      url: window.location.href,
      priceCurrency: "USD",
      price: product.salePrice || product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <SEO
        title={product.name}
        description={product.shortDescription || product.description}
        image={product.images?.[0]}
        type="product"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
    </>
  );
};

// Blog SEO
export const BlogSEO = ({ post }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    image: post.featuredImage,
    author: {
      "@type": "Person",
      name: post.author?.name || "Admin",
    },
    publisher: {
      "@type": "Organization",
      name: "My E-commerce Store",
      logo: {
        "@type": "ImageObject",
        url: "/logo.png",
      },
    },
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    description: post.summary,
  };

  return (
    <>
      <SEO
        title={post.title}
        description={post.summary}
        image={post.featuredImage}
        type="article"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
    </>
  );
};

export default SEO;
