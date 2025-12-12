import mongoose from "mongoose";
import dotenv from "dotenv";
import slugify from "slugify";

// Import models
import Product from "./models/Product.js";
import Category from "./models/Category.js";
import Tag from "./models/Tag.js";
import Blog from "./models/Blog.js";
import BlogCategory from "./models/BlogCategory.js";
import BlogTag from "./models/BlogTag.js";

dotenv.config();

const cleanData = async () => {
  console.log("Cleaning up old demo data...");
  // Optional: clear specific collections or just append? 
  // For safety in a demo context, let's just append or ensure unique names.
  // But usually, one wants a fresh start or to not duplicate specific items.
  // I will check for existence before creating to avoid duplicates if run multiple times.
};

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // 1. Categories (Clothing & Accessories)
    const categoryNames = [
      "Men's Clothing",
      "Women's Clothing",
      "Accessories",
      "Footwear",
      "Activewear",
    ];

    const categoryMap = {};

    for (const name of categoryNames) {
      let cat = await Category.findOne({ name });
      if (!cat) {
        cat = await Category.create({
          name,
          slug: slugify(name, { lower: true }),
          description: `Best collection of ${name}`,
        });
        console.log(`Created Category: ${name}`);
      }
      categoryMap[name] = cat._id;
    }

    // 2. Tags
    const tagNames = ["Summer", "Winter", "Casual", "Formal", "Trending", "New Arrival"];
    const tagDocs = [];
    for (const name of tagNames) {
      let tag = await Tag.findOne({ name });
      if (!tag) {
        tag = await Tag.create({
          name,
          slug: slugify(name, { lower: true }),
        });
        console.log(`Created Tag: ${name}`);
      }
      tagDocs.push(tag._id);
    }

    // 3. Products
    const products = [
      { name: "Classic White T-Shirt", price: 29.99, cat: "Men's Clothing" },
      { name: "Slim Fit Jeans", price: 49.99, cat: "Men's Clothing" },
      { name: "Leather Jacket", price: 199.99, cat: "Men's Clothing" },
      { name: "Floral Summer Dress", price: 39.99, cat: "Women's Clothing" },
      { name: "High Heels", price: 59.99, cat: "Footwear" },
      { name: "Running Sneakers", price: 89.99, cat: "Footwear" },
      { name: "Smart Watch", price: 149.99, cat: "Accessories" },
      { name: "Sunglasses", price: 19.99, cat: "Accessories" },
      { name: "Yoga Pants", price: 34.99, cat: "Activewear" },
      { name: "Sports Bra", price: 24.99, cat: "Activewear" },
      { name: "Graphic Hoodie", price: 45.00, cat: "Men's Clothing" },
      { name: "Denim Skirt", price: 35.00, cat: "Women's Clothing" },
      { name: "Leather Belt", price: 15.00, cat: "Accessories" },
      { name: "Baseball Cap", price: 12.00, cat: "Accessories" },
      { name: "Winter Scarf", price: 18.00, cat: "Accessories" },
      { name: "Ankle Boots", price: 65.00, cat: "Footwear" },
      { name: "Chino Shorts", price: 28.00, cat: "Men's Clothing" },
      { name: "Blazer", price: 85.00, cat: "Women's Clothing" },
      { name: "Backpack", price: 40.00, cat: "Accessories" },
      { name: "Wristband", price: 5.00, cat: "Accessories" },
      { name: "Tracksuit", price: 70.00, cat: "Activewear" },
      { name: "Polo Shirt", price: 32.00, cat: "Men's Clothing" },
      { name: "Maxi Dress", price: 55.00, cat: "Women's Clothing" },
      { name: "Sandals", price: 22.00, cat: "Footwear" },
      { name: "Beanie", price: 14.00, cat: "Accessories" },
    ];

    for (const p of products) {
      let product = await Product.findOne({ name: p.name });
      if (!product) {
        // Randomly assign 1-2 tags
        const pTags = [
            tagDocs[Math.floor(Math.random() * tagDocs.length)],
            tagDocs[Math.floor(Math.random() * tagDocs.length)]
        ];
        
        // Generate keywords for images based on category or name
        const imgKeyword = p.cat.split(' ')[0].toLowerCase() + ',' + p.name.split(' ').pop().toLowerCase();

        product = await Product.create({
          name: p.name,
          slug: slugify(p.name, { lower: true }),
          sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}-${slugify(p.name, { lower: true })}`,
          price: p.price,
          description: `This is a premium high-quality ${p.name}. Perfect for your wardrobe.`,
          shortDescription: `Buy ${p.name} at the best price.`,
          category: [categoryMap[p.cat]],
          tags: [...new Set(pTags)], // unique tags
          status: "Published",
          stockStatus: "In Stock",
          quantity: 50,
          images: [
              `https://loremflickr.com/600/600/${imgKeyword}?random=${Math.floor(Math.random() * 1000)}`,
              `https://loremflickr.com/600/600/${imgKeyword}?random=${Math.floor(Math.random() * 1000)}`
          ]
        });
        console.log(`Created Product: ${p.name}`);
      }
    }

    // 4. Blog Categories
    const blogCats = ["Fashion Trends", "Style Tips", "Industry News"];
    const blogCatDocs = []; 
    
    // However, I should still populate BlogCategory collection for consistency if it exists.
    for (const name of blogCats) {
      let bc = await BlogCategory.findOne({ name });
      if (!bc) {
        bc = await BlogCategory.create({
            name,
            slug: slugify(name, { lower: true }),
            description: `Blog posts about ${name}`
        });
        console.log(`Created Blog Category: ${name}`);
      }
      blogCatDocs.push(name);
    }

    // 5. Blog Tags
    const blogTagNames = ["OOTD", "SummerVibes", "WinterCollection", "Guide", "News"];
    const blogTagDocs = [];
    for (const name of blogTagNames) {
        let bt = await BlogTag.findOne({ name });
        if (!bt) {
            bt = await BlogTag.create({
                name,
                slug: slugify(name, { lower: true }),
            });
            console.log(`Created Blog Tag: ${name}`);
        }
        blogTagDocs.push(name);
    }

    // 6. Blogs
    const blogTitles = [
        "Top 10 Summer Trends for 2025",
        "How to Style Your Denim Jacket",
        "The Ultimate Guide to Accessories",
        "Why Sustainable Fashion Matters",
        "5 Must-Have Items for Your Wardrobe",
        "Men's Fashion Week Highlights",
        "Choosing the Right Running Shoes",
        "Accessorize Like a Pro",
        "Winter Coat Guide",
        "Best Fabrics for Hot Weather",
        "Street Style Evolution",
        "Formal Wear Etiquette",
        "Sneaker Culture Explained",
        "Minimalist Wardrobe Essentials",
        "How to Clean Leather Goods",
        "Hat Styles You Need to Know",
        "Yoga Wear Beyond the Gym",
        "The Return of Vintage Fashion",
        "Color Theory in Outfit Matching",
        "Packing for a Beach Vacation",
        "Smart Watches: Fashion or Function?",
        "History of the T-Shirt",
        "Boots for Every Season",
        "Layering 101",
        "Fashion on a Budget"
    ];

    for (const title of blogTitles) {
        let blog = await Blog.findOne({ title });
        if (!blog) {
            const randomCat = blogCatDocs[Math.floor(Math.random() * blogCatDocs.length)];
            const randomTag = blogTagDocs[Math.floor(Math.random() * blogTagDocs.length)];

            await Blog.create({
                title,
                subtitle: `Read about ${title}`,
                slug: slugify(title, { lower: true }),
                summary: `This is a summary for the blog post titled ${title}.`,
                content: `<p>Here is the full content for <strong>${title}</strong>. It discusses various aspects of clothing and accessories.</p>`,
                status: "Published",
                category: randomCat,
                tags: [randomTag],
                author: "Demo Admin",
                publishedAt: new Date(),
                featuredImage: `https://loremflickr.com/800/400/fashion,clothing?random=${Math.floor(Math.random() * 1000)}`
            });
            console.log(`Created Blog: ${title}`);
        }
    }

    console.log("Seed complete!");
    process.exit(0);

  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seedData();
