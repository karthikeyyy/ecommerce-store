import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

function Header() {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) =>
    location.pathname === path 
      ? "text-black dark:text-white font-semibold" 
      : "text-gray-500 dark:text-gray-400";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:py-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black dark:bg-white text-white dark:text-black">
              <span className="text-lg font-semibold">M</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
                MyStore
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Modern E-commerce
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link to="/" className={isActive("/")}>
              Home
            </Link>
            <Link to="/products" className={isActive("/products")}>
              Shop
            </Link>
            <Link to="/blogs" className={isActive("/blogs")}>
              Blog
            </Link>
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3 md:gap-4">
          {/* Global Search */}
          <div className="hidden max-w-xs flex-1 items-center rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-500 shadow-sm md:flex focus-within:ring-1 focus-within:ring-black dark:focus-within:ring-white">
            <span className="mr-2 text-xs text-gray-400">⌕</span>
            <input
              type="text"
              placeholder={location.pathname.includes('/blogs') ? "Search blogs" : "Search products"}
              className="w-full border-none bg-transparent text-sm text-gray-700 dark:text-gray-200 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const query = e.target.value.trim();
                  if (location.pathname.includes('/blogs')) {
                    window.location.href = `/blogs?search=${encodeURIComponent(query)}`;
                  } else {
                    window.location.href = `/products?search=${encodeURIComponent(query)}`;
                  }
                }
              }}
            />
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-yellow-500" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          <Link
            to="/cart"
            className="relative flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-800 dark:text-gray-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-black dark:bg-white px-1 text-xs font-semibold text-white dark:text-black">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="relative" ref={dropdownRef}>
            {/* Profile Button */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm focus:outline-none"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-bold uppercase text-gray-600 dark:text-gray-300">
                {user && user.name ? user.name.charAt(0) : <span className="text-gray-400">👤</span>}
              </div>
              <span className="hidden md:inline">{user ? user.name : "Profile"}</span>
              <span className="text-gray-400 text-xs">▼</span>
            </button>

            {/* Dropdown Content */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 shadow-lg z-50">
                {user ? (
                  <>
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                    <Link
                      to="/account"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      My Account
                    </Link>
                    <Link
                      to="/account/orders"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Wishlist
                    </Link>
                    <Link
                      to="/help"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Help Center
                    </Link>
                    <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setIsDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
