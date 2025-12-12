// Database indexing script for production optimization
// Run this after deployment: node scripts/createIndexes.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const createIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Products Collection
    console.log('Creating Product indexes...');
    await db.collection('products').createIndex({ name: 'text', description: 'text' });
    await db.collection('products').createIndex({ slug: 1 }, { unique: true });
    await db.collection('products').createIndex({ category: 1 });
    await db.collection('products').createIndex({ tags: 1 });
    await db.collection('products').createIndex({ status: 1 });
    await db.collection('products').createIndex({ stock: 1 });
    await db.collection('products').createIndex({ price: 1 });
    await db.collection('products').createIndex({ createdAt: -1 });

    // Orders Collection
    console.log('Creating Order indexes...');
    await db.collection('orders').createIndex({ user: 1 });
    await db.collection('orders').createIndex({ status: 1 });
    await db.collection('orders').createIndex({ createdAt: -1 });
    await db.collection('orders').createIndex({ 'items.product': 1 });

    // Users Collection
    console.log('Creating User indexes...');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });

    // Coupons Collection
    console.log('Creating Coupon indexes...');
    await db.collection('coupons').createIndex({ code: 1 }, { unique: true });
    await db.collection('coupons').createIndex({ isActive: 1, validUntil: 1 });

    // Inventory Logs Collection
    console.log('Creating InventoryLog indexes...');
    await db.collection('inventorylogs').createIndex({ product: 1, createdAt: -1 });
    await db.collection('inventorylogs').createIndex({ type: 1 });

    // Reviews Collection
    console.log('Creating Review indexes...');
    await db.collection('reviews').createIndex({ product: 1 });
    await db.collection('reviews').createIndex({ user: 1 });
    await db.collection('reviews').createIndex({ createdAt: -1 });

    // Blogs Collection
    console.log('Creating Blog indexes...');
    await db.collection('blogs').createIndex({ slug: 1 }, { unique: true });
    await db.collection('blogs').createIndex({ title: 'text', content: 'text' });
    await db.collection('blogs').createIndex({ status: 1 });

    console.log('✅ All indexes created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating indexes:', error);
    process.exit(1);
  }
};

createIndexes();
