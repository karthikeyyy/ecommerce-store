import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import axiosClient from "../api/axiosClient";

function Checkout() {
  const { items, cartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const isLoggedIn = isAuthenticated;

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
  });

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
          No items to checkout
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Add products to your cart before continuing to checkout.
        </p>
      </div>
    );
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleApplyCoupon() {
    if (!couponCode) return;
    try {
      // Extract product IDs and categories (if available in item data)
      const productIds = items.map(i => i._id);
      const categoryIds = items.flatMap(i => {
        if (Array.isArray(i.category)) return i.category.map(c => typeof c === 'object' ? c._id : c);
        if (typeof i.category === 'object') return [i.category._id];
        return [i.category];
      }).filter(Boolean);

      const res = await axiosClient.post('/coupons/validate', {
        code: couponCode,
        cartTotal,
        productIds,
        categoryIds
      });
      const coupon = res.data.data; // Backend returns data object wrapper

      let discountAmount = res.data.data.discount; // Backend calculates discount now!

      // If backend didn't calculate (older API), fallback to frontend calc
      if (discountAmount === undefined) {
        if (coupon.type === 'percentage') {
          discountAmount = (cartTotal * coupon.value) / 100;
        } else {
          discountAmount = coupon.value;
        }
      }

      // Cap discount at total
      if (discountAmount > cartTotal) discountAmount = cartTotal;

      setDiscount(discountAmount);
      setCouponMessage(`Coupon applied! You saved ₹${discountAmount}`);
    } catch (err) {
      setDiscount(0);
      setCouponMessage(err.response?.data?.message || "Invalid coupon");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !form.fullName ||
      !form.phone ||
      !form.address ||
      !form.city ||
      !form.state ||
      !form.postalCode
    ) {
      setError("Please fill all required fields.");
      return;
    }

    const payload = {
      items: items.map((i) => ({
        product: i._id,
        quantity: i.quantity,
        price: i.price,
        selectedAttributes: i.selectedAttributes
          ? Object.entries(i.selectedAttributes).map(([name, value]) => ({ name, value }))
          : []
      })),
      shippingAddress: form,
      paymentMethod: "COD",
      totalAmount: cartTotal - discount,
    };

    try {
      setLoading(true);
      const res = await axiosClient.post("/orders", payload);
      setSuccess("Order placed successfully!");
      clearCart();

      const orderId =
        res.data?.order?._id ||
        res.data?.data?._id ||
        res.data?._id;

      setTimeout(() => {
        if (orderId) {
          navigate(`/account/orders/${orderId}`);
        } else {
          navigate("/products");
        }
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to place order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="mb-6 text-2xl font-semibold tracking-tight text-gray-900">
        Checkout
      </h2>

      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-gray-900">
            Shipping details
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Full name
              </label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-black focus:outline-none"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Phone
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-black focus:outline-none"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Pincode
              </label>
              <input
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-black focus:outline-none"
                placeholder="e.g. 302017"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Address
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-black focus:outline-none"
                placeholder="House no, street, locality"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                City
              </label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-black focus:outline-none"
                placeholder="City"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                State
              </label>
              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-black focus:outline-none"
                placeholder="State"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-70 md:w-64"
          >
            {loading ? "Placing order..." : "Place order (COD)"}
          </button>
        </form>

        <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">
            Order summary
          </h3>

          <div className="mt-4 space-y-3 text-sm">
            {items.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex gap-2">
                  {(item.image || item.mainImage) && (
                    <div className="h-12 w-12 rounded bg-gray-100 overflow-hidden shrink-0">
                      <img src={item.image || item.mainImage} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="line-clamp-1 text-gray-800 font-medium">
                      {item.name}
                    </span>
                    {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {Object.entries(item.selectedAttributes).map(([k, v]) => (
                          <span key={k} className="inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 border border-gray-200">
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="mt-1 text-xs text-gray-500">
                      Qty {item.quantity}
                    </span>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-700 mb-1">Have a coupon?</p>
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Promo Code"
                  className="flex-1 border rounded px-2 py-1 text-sm uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="bg-black text-white px-3 py-1 text-xs rounded"
                >
                  Apply
                </button>
              </div>
              {couponMessage && <p className={`text-xs mt-1 ${discount > 0 ? 'text-green-600' : 'text-red-500'}`}>{couponMessage}</p>}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>₹{cartTotal}</span>
            </div>
            {discount > 0 && (
              <div className="flex items-center justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div className="mt-1 flex items-center justify-between text-sm text-gray-600">
              <span>Shipping</span>
              <span className="text-gray-500">Calculated at delivery</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm font-semibold text-gray-900">
              <span>Total</span>
              <span>₹{cartTotal - discount}</span>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Payment method: Cash on Delivery (for now).
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Checkout;
