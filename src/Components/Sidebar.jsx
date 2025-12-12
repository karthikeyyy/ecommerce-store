import React, { useState, useEffect } from "react";
import {
  Home,
  Users,
  Settings,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  ChevronDown,
  FileText,
  Calendar as CalendarIcon,
  Package,
  Ticket,
  BookOpen,
  MessagesSquare,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const toggleDropdown = (name) => {
    if (isCollapsed) setIsCollapsed(false);
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const permissions = user.permissions || [];

  const can = (perm) => {
    if (permissions.includes("*")) return true;
    return permissions.includes(perm);
  };

  const menuItems = [
    { name: "Dashboard", icon: <Home className="w-5 h-5" />, path: "/dashboard", perms: [] },
    { name: "Orders", icon: <ShoppingBag className="w-5 h-5" />, path: "/orders", perms: [] },
    { name: "Inventory", icon: <Package className="w-5 h-5" />, path: "/inventory", perms: [] },
    { name: "Coupons", icon: <Ticket className="w-5 h-5" />, path: "/coupons", perms: [] },
    { name: "Users", icon: <Users className="w-5 h-5" />, path: "/users", perms: ["user:read"] },
    { name: "Analytics", icon: <BarChart3 className="w-5 h-5" />, path: "/analytics", perms: [] },
    { name: "Calendar", icon: <CalendarIcon className="w-5 h-5" />, path: "/calendar", perms: [] },
    { name: "Settings", icon: <Settings className="w-5 h-5" />, path: "/settings", perms: [] },
    {
      name: "Products",
      icon: <BookOpen className="w-5 h-5" />,
      perms: ["product:read"],
      subItems: [
        { name: "Product List", path: "/product" },
        { name: "Add Product", path: "/add-product" },
        { name: "Category List", path: "/categories" },
        { name: "Attributes", path: "/attributes" },
        { name: "Tags", path: "/tags" },
      ],
    },
    {
      name: "Blog",
      icon: <FileText className="w-5 h-5" />,
      perms: [],
      subItems: [
        { name: "Blog Home", path: "/blog" },
        { name: "Blog Post", path: "/blog/new" },
        { name: "Category", path: "/blog-categories" },
        { name: "Tags", path: "/blog/tags" },
      ],
    },
    { name: "Reviews", icon: <MessagesSquare className="w-5 h-5" />, path: "/reviews", perms: [] },
  ];

  useEffect(() => {
    const itemWithSub = menuItems.find(
      (m) =>
        m.subItems &&
        m.subItems.some((s) => s.path === location.pathname)
    );
    if (itemWithSub) {
      setOpenDropdown(itemWithSub.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // Clear user data too
    window.location.href = "/login";
  };

  return (
    <aside
      className={`${isCollapsed ? "sticky top-0" : "sticky top-0 min_side"
        } border-r border-gray-200 dark:border-slate-800 h-screen flex flex-col justify-between transition-all duration-300 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100`}
    >
      <div>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-800">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              Admin<span className="text-emerald-500">Panel</span>
            </h1>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-500 dark:text-slate-400" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-500 dark:text-slate-400" />
            )}
          </button>
        </div>

        <nav className="flex flex-col mt-4 space-y-1 px-2">
          {menuItems
            .filter((item) =>
              item.perms.length === 0 ? true : can(item.perms[0])
            )
            .map((item, index) => (
              <div key={index}>
                {item.subItems ? (
                  <>
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className={`flex items-center justify-between w-full px-3 py-2 text-sm transition-all rounded-lg font-medium ${openDropdown === item.name
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        {!isCollapsed && <span>{item.name}</span>}
                      </div>
                      {!isCollapsed && (
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${openDropdown === item.name ? "rotate-180" : ""
                            }`}
                        />
                      )}
                    </button>

                    {openDropdown === item.name && !isCollapsed && (
                      <div className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-2 dark:border-slate-800">
                        {item.subItems.map((subItem, subIndex) => (
                          <Link
                            key={subIndex}
                            to={subItem.path}
                            className={`block px-3 py-2 text-sm rounded-lg transition-all font-medium ${isActive(subItem.path)
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-900"
                              }`}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 text-sm transition-all rounded-lg font-medium ${isActive(item.path)
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                      }`}
                  >
                    {item.icon}
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                )}
              </div>
            ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full px-3 py-2 rounded-lg transition-all dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200 font-medium"
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && (
            <span className="text-sm">
              Logout
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
