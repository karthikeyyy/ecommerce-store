import React from "react";

const Footer = () => {
  return (
    <footer className="w-full bg-white dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 py-4 px-6 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500 dark:text-slate-400 transition-colors duration-300">
      {/* Left Section */}
      <p className="text-center sm:text-left">
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold text-gray-900 dark:text-slate-200">
          Admin<span className="text-emerald-500">Panel</span>
        </span>. All rights reserved.
      </p>

      {/* Right Section */}
      <div className="flex items-center gap-6 mt-2 sm:mt-0">
        <a href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
          Privacy Policy
        </a>
        <a href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
          Terms
        </a>
        <a href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
          Support
        </a>
      </div>
    </footer>
  );
};

export default Footer;
