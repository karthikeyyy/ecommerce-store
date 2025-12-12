import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import EditProfile from "./pages/EditProfile";
import Wishlist from "./pages/Wishlist";
import AboutUs from "./pages/AboutUs";
import HelpCenter from "./pages/HelpCenter";
import ContactUs from "./pages/ContactUs";
import OrderTracking from "./pages/OrderTracking";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import MyAccount from "./pages/MyAccount";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import CartSuccessModal from "./components/CartSuccessModal";

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/blogs" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/track-order" element={<OrderTracking />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* User Dashboard Routes */}
          <Route path="/account" element={<MyAccount />} />
          <Route path="/account/profile" element={<EditProfile />} />
          <Route path="/account/orders" element={<MyOrders />} />
          <Route path="/account/orders/:id" element={<OrderDetails />} />
        </Routes>
      </main>
      <Footer />
      <CartSuccessModal />
    </div>
  );
}

export default App;

