import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Trash2 } from "lucide-react";

function Cart() {
  const { items, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Your cart is empty
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Add some products to your cart to continue shopping.
        </p>
        <div className="mt-6">
          <Link
            to="/products"
            className="inline-flex items-center rounded-full bg-black dark:bg-white px-6 py-2.5 text-sm font-medium text-white dark:text-black shadow-sm transition hover:bg-gray-900 dark:hover:bg-gray-100"
          >
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  function handleCheckout() {
    navigate("/checkout");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="mb-6 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
        Your cart
      </h2>

      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {items.length} item{items.length > 1 ? "s" : ""} in your cart
            </p>
            <button
              onClick={clearCart}
              className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
            >
              Clear cart
            </button>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {items.map((item) => (
              <div
                key={item._id}
                className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-4 sm:flex-1">
                  {(item.image || item.mainImage) && (
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700">
                      <img
                        src={item.image || item.mainImage}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </div>
                    {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {Object.entries(item.selectedAttributes).map(([key, val]) => (
                          <span key={key} className="inline-flex items-center rounded bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
                            <span className="text-gray-500 dark:text-gray-400 mr-1">{key}:</span> {val}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      ₹{item.price}
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 items-center justify-between gap-4 sm:justify-end">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Qty</span>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item._id, e.target.value)}
                      className="h-9 w-16 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 text-sm text-gray-800 dark:text-gray-200 focus:border-black dark:focus:border-white focus:outline-none"
                    />
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      ₹{item.price * item.quantity}
                    </div>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="mt-1 inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Order summary
          </h3>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
              <span className="font-medium text-gray-900 dark:text-white">₹{cartTotal}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Shipping</span>
              <span className="text-gray-500 dark:text-gray-400">Calculated at checkout</span>
            </div>
          </div>
          <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between text-sm font-semibold text-gray-900 dark:text-white">
              <span>Total</span>
              <span>₹{cartTotal}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            className="mt-5 w-full rounded-full bg-black dark:bg-white px-6 py-3 text-sm font-medium text-white dark:text-black shadow-sm transition hover:bg-gray-900 dark:hover:bg-gray-100"
          >
            Proceed to checkout
          </button>

          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Secure checkout. Cash on delivery supported in this version.
          </p>
        </aside>
      </div>
    </div>
  );
}

export default Cart;
