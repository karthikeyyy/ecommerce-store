import React, { useEffect, useState, useRef } from "react";
import { Menu, Bell, User, Search, Sun, Moon, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Theme state
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored) return stored;
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  });

  // User state
  const [user, setUser] = useState(null);

  // Load logged-in user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <nav className="w-full bg-white dark:bg-slate-950/80 dark:backdrop-blur-md border-b border-gray-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm transition-colors duration-300 sticky top-0 z-50">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {/* Sidebar Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 md:hidden transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-700 dark:text-slate-200" />
        </button>

        {/* Logo */}
        <h1 className="text-xl font-semibold text-gray-900 dark:text-slate-100 md:hidden">
          Admin<span className="text-emerald-500">Panel</span>
        </h1>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-slate-100 hidden md:block">
          Dashboard
        </h1>
      </div>

      {/* Center Search Bar */}
      <div className="hidden md:flex items-center bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 w-1/3 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
        <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 mr-2" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none w-full text-sm text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors border border-transparent dark:border-slate-800"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors border border-transparent dark:border-slate-800">
          <Bell className="w-5 h-5 text-gray-600 dark:text-slate-300" />
          <span className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[10px] font-bold rounded-full w-2 h-2"></span>
        </button>

        {/* User Section with Dropdown */}
        <div className="relative" ref={profileRef}>
          <div
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 p-1.5 pr-3 rounded-full border border-gray-200 dark:border-slate-800 transition-all select-none"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-slate-200 hidden sm:block">
              {user?.name || "User"}
            </span>
          </div>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800">
                <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{user?.name || "User Name"}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">{user?.email || "user@example.com"}</p>
                <div className="mt-2 text-xs inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-100 dark:border-emerald-500/20">
                  {user?.role || "Admin"}
                </div>
              </div>

              <div className="p-2">
                <button
                  onClick={() => {
                    navigate('/settings');
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Edit Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
