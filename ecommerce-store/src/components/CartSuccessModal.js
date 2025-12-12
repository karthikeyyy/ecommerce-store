import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function CartSuccessModal() {
  const navigate = useNavigate();
  const { showCartModal, setShowCartModal, lastAddedProduct } = useCart();

  if (!showCartModal || !lastAddedProduct) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" 
      onClick={() => setShowCartModal(false)}
    >
      <div 
        className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          {/* Product Image */}
          {lastAddedProduct.image && (
            <div className="flex-shrink-0">
              <img 
                src={lastAddedProduct.image} 
                alt={lastAddedProduct.name}
                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Success Icon & Title */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 flex-shrink-0">
                <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Added to Cart</h3>
            </div>

            {/* Product Info */}
            <p className="text-sm text-gray-700 mb-1 line-clamp-2">
              {lastAddedProduct.name}
            </p>
            <p className="text-xs text-gray-500">
              Qty: {lastAddedProduct.quantity}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setShowCartModal(false)}
            className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Continue
          </button>
          <button
            onClick={() => {
              setShowCartModal(false);
              navigate('/cart');
            }}
            className="flex-1 px-4 py-2 text-sm bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition"
          >
            View Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartSuccessModal;
