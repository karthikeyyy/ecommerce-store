import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./Pages/Dashboard";
import Login from "./Auth/Login";
import Register from "./Auth/Register";
import ProtectedRoute from "./Components/ProtectedRoute";

import Product from "./Pages/Product";
import AddProduct from "./Pages/AddProduct";
import EditProduct from "./Pages/EditProduct";
import Users from "./Pages/Users";
import EditUser from "./Pages/EditUser";
import AddUser from "./Pages/AddUser";
import Settings from "./Pages/Settings";
import Orders from "./Pages/Orders";
import CategoryList from "./Pages/CategoryList";
import Tags from "./Pages/Tags";
import BlogList from "./Pages/BlogList";
import AddBlog from "./Pages/AddBlog";
import EditBlog from "./Pages/EditBlog";
import Calendar from "./Pages/Calendar";
import Reviews from "./Pages/Reviews";
import Analytics from "./Pages/Analytics";
import BlogCategoryList from "./Pages/BlogCategoryList";
import BlogTagList from "./Pages/BlogTagList";
import OrderDetail from "./Pages/OrderDetail";
import Inventory from "./Pages/Inventory";
import Coupons from "./Pages/Coupons";
import AddCoupon from "./Pages/AddCoupon";
import EditCoupon from "./Pages/EditCoupon";
import Attributes from "./Pages/Attributes";
import AddAttribute from "./Pages/AddAttribute";
import EditAttribute from "./Pages/EditAttribute";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/coupons"
          element={
            <ProtectedRoute>
              <Coupons />
            </ProtectedRoute>
          }
        />

        <Route
          path="/coupons/add"
          element={
            <ProtectedRoute>
              <AddCoupon />
            </ProtectedRoute>
          }
        />

        <Route
          path="/coupons/:id/edit"
          element={
            <ProtectedRoute>
              <EditCoupon />
            </ProtectedRoute>
          }
        />

        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <CategoryList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tags"
          element={
            <ProtectedRoute>
              <Tags />
            </ProtectedRoute>
          }
        />

        <Route
          path="/attributes"
          element={
            <ProtectedRoute requiredPermissions={["product:create", "*"]}>
              <Attributes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/attributes/add"
          element={
            <ProtectedRoute requiredPermissions={["product:create", "*"]}>
              <AddAttribute />
            </ProtectedRoute>
          }
        />

        <Route
          path="/attributes/:id/edit"
          element={
            <ProtectedRoute requiredPermissions={["product:create", "product:update", "*"]}>
              <EditAttribute />
            </ProtectedRoute>
          }
        />

        {/* Users */}
        <Route path="/users/add" element={<AddUser />} />

        <Route
          path="/users"
          element={
            <ProtectedRoute requiredPermissions={["user:read", "*"]}>
              <Users />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users/:id/edit"
          element={
            <ProtectedRoute requiredPermissions={["user:update", "*"]}>
              <EditUser />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reviews"
          element={
            <ProtectedRoute>
              <Reviews />
            </ProtectedRoute>
          }
        />

        {/* Products */}
        <Route
          path="/product"
          element={
            <ProtectedRoute requiredPermissions={["product:read"]}>
              <Product />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-product"
          element={
            <ProtectedRoute requiredPermissions={["product:create"]}>
              <AddProduct />
            </ProtectedRoute>
          }
        />
        <Route path="/blog-categories" element={<BlogCategoryList />} />
        <Route path="/blog/tags" element={<BlogTagList />} />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-product/:id"
          element={
            <ProtectedRoute requiredPermissions={["product:update"]}>
              <EditProduct />
            </ProtectedRoute>
          }
        />

        {/* Blog */}
        <Route
          path="/blog"
          element={
            <ProtectedRoute>
              <BlogList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/blog/new"
          element={
            <ProtectedRoute>
              <AddBlog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          }
        />

        <Route
          path="/blog/:id/edit"
          element={
            <ProtectedRoute>
              <EditBlog />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="/not-authorized" element={<div>Not Authorized</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
