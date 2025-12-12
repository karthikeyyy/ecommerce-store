import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="mt-10 border-t border-gray-200 bg-gray-950 text-gray-400">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-900">
                <span className="text-lg font-semibold">M</span>
              </div>
              <span className="text-sm font-semibold text-white">
                MyStore
              </span>
            </div>
            <p className="max-w-md text-sm text-gray-500">
              A clean, modern shopping experience powered by your custom
              admin panel and API.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">
              Shop
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products?category=Men's Clothing" className="hover:text-gray-200">
                  Men's Clothing
                </Link>
              </li>
              <li>
                <Link to="/products?category=Women's Clothing" className="hover:text-gray-200">
                  Women's Clothing
                </Link>
              </li>
              <li>
                <Link to="/products?category=Accessories" className="hover:text-gray-200">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">
              Support
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/help" className="hover:text-gray-200">
                  Help center
                </a>
              </li>
              <li>
                <a href="/track-order" className="hover:text-gray-200">
                  Order tracking
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-gray-200">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-4 text-xs text-gray-600 md:flex-row">
          <p>© {new Date().getFullYear()} MyStore. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/about" className="hover:text-gray-300">
              About Us
            </Link>
            <Link to="/terms" className="hover:text-gray-300">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-gray-300">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
