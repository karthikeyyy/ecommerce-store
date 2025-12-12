import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import axiosClient from "../api/axiosClient";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  // Load cart from database for authenticated users, or localStorage for guests
  useEffect(() => {
    async function loadCart() {
      if (isAuthenticated && user) {
        // Fetch from database for authenticated users
        try {
          const res = await axiosClient.get("/cart");
          if (res.data?.success && res.data?.cart) {
            const formattedCart = res.data.cart.map(item => ({
              _id: item.product._id,
              name: item.product.name,
              price: item.product.salePrice ?? item.product.price,
              image: item.product.mainImage || (item.product.images?.[0]),
              quantity: item.quantity,
              selectedAttributes: Array.isArray(item.selectedAttributes)
                ? item.selectedAttributes.reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {})
                : (item.selectedAttributes || {})
            }));
            setItems(formattedCart);
          }
        } catch (error) {
          console.error("Failed to load cart from database:", error);
        }
      } else {
        // Load from localStorage for guest users
        try {
          const stored = localStorage.getItem("cartItems");
          if (stored) {
            setItems(JSON.parse(stored));
          }
        } catch {
          setItems([]);
        }
      }
      setInitialLoad(false);
    }

    loadCart();
  }, [isAuthenticated, user]);

  // Sync local cart with backend when user logs in (only once per session)
  useEffect(() => {
    if (isAuthenticated && user && !syncing && !initialLoad) {
      const hasAlreadySynced = sessionStorage.getItem('cartSynced');
      if (!hasAlreadySynced && items.length > 0) {
        syncCartWithBackend();
        sessionStorage.setItem('cartSynced', 'true');
      }
    }
  }, [isAuthenticated, user, initialLoad]);

  // Save to localStorage ONLY for guest users
  useEffect(() => {
    if (!isAuthenticated && !initialLoad) {
      localStorage.setItem("cartItems", JSON.stringify(items));
    }
  }, [items, isAuthenticated, initialLoad]);

  async function syncCartWithBackend() {
    try {
      setSyncing(true);
      const localCart = items.map(item => ({
        productId: item._id,
        quantity: item.quantity,
        selectedAttributes: item.selectedAttributes
      }));

      // Only sync if there are local items
      if (localCart.length > 0) {
        const res = await axiosClient.post("/cart/sync", { localCart });
        
        // Update items from server response
        if (res.data?.success && res.data?.cart) {
          const formattedCart = res.data.cart.map(item => ({
            _id: item.product._id,
            name: item.product.name,
            price: item.product.salePrice ?? item.product.price,
            image: item.product.mainImage || (item.product.images?.[0]),
            quantity: item.quantity,
            selectedAttributes: Array.isArray(item.selectedAttributes)
              ? item.selectedAttributes.reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {})
              : (item.selectedAttributes || {})
          }));
          setItems(formattedCart);
          // Clear localStorage after syncing for authenticated users
          localStorage.removeItem("cartItems");
        }
      } else {
        // Just fetch current cart from server
        const res = await axiosClient.get("/cart");
        if (res.data?.success && res.data?.cart) {
          const formattedCart = res.data.cart.map(item => ({
            _id: item.product._id,
            name: item.product.name,
            price: item.product.salePrice ?? item.product.price,
            image: item.product.mainImage || (item.product.images?.[0]),
            quantity: item.quantity,
            selectedAttributes: Array.isArray(item.selectedAttributes)
              ? item.selectedAttributes.reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {})
              : (item.selectedAttributes || {})
          }));
          setItems(formattedCart);
        }
      }
    } catch (error) {
      console.error("Cart sync error:", error);
    } finally {
      setSyncing(false);
    }
  }

  async function addToCart(product, quantity = 1) {
    const price = product.salePrice ?? product.price;
    const image = product.mainImage || (product.images && product.images.length > 0 ? product.images[0] : null);
    const selectedAttributes = product.selectedAttributes || {};

    if (isAuthenticated) {
      try {
        const res = await axiosClient.post("/cart", {
          productId: product._id,
          quantity,
          selectedAttributes
        });

        if (res.data?.success && res.data?.cart) {
          const formattedCart = res.data.cart.map(item => ({
            _id: item.product._id,
            name: item.product.name,
            price: item.product.salePrice ?? item.product.price,
            image: item.product.mainImage || (item.product.images?.[0]),
            quantity: item.quantity,
            selectedAttributes: Array.isArray(item.selectedAttributes)
                ? item.selectedAttributes.reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {})
                : (item.selectedAttributes || {})
          }));
          setItems(formattedCart);
          
          // Show success modal
          setLastAddedProduct({ name: product.name, image, quantity });
          setShowCartModal(true);
        }
      } catch (error) {
        console.error("Add to cart error:", error);
        // Fallback to local storage
        updateLocalCart(product, quantity, price, image, selectedAttributes);
        
        // Show success modal even for fallback
        setLastAddedProduct({ name: product.name, image, quantity });
        setShowCartModal(true);
      }
    } else {
      updateLocalCart(product, quantity, price, image, selectedAttributes);
      
      // Show success modal
      setLastAddedProduct({ name: product.name, image, quantity });
      setShowCartModal(true);
    }
  }

  function updateLocalCart(product, quantity, price, image, selectedAttributes) {
    setItems(prev => {
      // Find existing item with same ID AND same attributes
      const existingIndex = prev.findIndex(i => {
        if (i._id !== product._id) return false;
        
        // Compare attributes
        const fattrs = i.selectedAttributes || {};
        const sattrs = selectedAttributes || {};
        
        const fkeys = Object.keys(fattrs);
        const skeys = Object.keys(sattrs);
        
        if (fkeys.length !== skeys.length) return false;
        
        return fkeys.every(key => fattrs[key] === sattrs[key]);
      });

      if (existingIndex > -1) {
        const newItems = [...prev];
        newItems[existingIndex].quantity += quantity;
        return newItems;
      }
      return [
        ...prev,
        {
          _id: product._id,
          name: product.name,
          price,
          image,
          quantity,
          selectedAttributes
        },
      ];
    });
  }

  async function removeFromCart(id) {
    if (isAuthenticated) {
      try {
        const res = await axiosClient.delete(`/cart/${id}`);
        if (res.data?.success && res.data?.cart) {
          const formattedCart = res.data.cart.map(item => ({
            _id: item.product._id,
            name: item.product.name,
            price: item.product.salePrice ?? item.product.price,
            image: item.product.mainImage || (item.product.images?.[0]),
            quantity: item.quantity,
            selectedAttributes: Array.isArray(item.selectedAttributes)
                ? item.selectedAttributes.reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {})
                : (item.selectedAttributes || {})
          }));
          setItems(formattedCart);
        }
      } catch (error) {
        console.error("Remove from cart error:", error);
        setItems(prev => prev.filter(i => i._id !== id));
      }
    } else {
      setItems(prev => prev.filter(i => i._id !== id));
    }
  }

  async function clearCart() {
    if (isAuthenticated) {
      try {
        await axiosClient.delete("/cart");
        setItems([]);
      } catch (error) {
        console.error("Clear cart error:", error);
        setItems([]);
      }
    } else {
      setItems([]);
    }
  }

  async function updateQuantity(id, quantity) {
    const qty = Number(quantity);
    if (Number.isNaN(qty) || qty <= 0) return;

    if (isAuthenticated) {
      try {
        const res = await axiosClient.put(`/cart/${id}`, { quantity: qty });
        if (res.data?.success && res.data?.cart) {
          const formattedCart = res.data.cart.map(item => ({
            _id: item.product._id,
            name: item.product.name,
            price: item.product.salePrice ?? item.product.price,
            image: item.product.mainImage || (item.product.images?.[0]),
            quantity: item.quantity,
            selectedAttributes: Array.isArray(item.selectedAttributes)
                ? item.selectedAttributes.reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {})
                : (item.selectedAttributes || {})
          }));
          setItems(formattedCart);
        }
      } catch (error) {
        console.error("Update quantity error:", error);
        setItems(prev =>
          prev.map(i => (i._id === id ? { ...i, quantity: qty } : i))
        );
      }
    } else {
      setItems(prev =>
        prev.map(i => (i._id === id ? { ...i, quantity: qty } : i))
      );
    }
  }

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const value = {
    items,
    addToCart,
    removeFromCart,
    clearCart,
    updateQuantity,
    cartCount,
    cartTotal,
    syncCartWithBackend,
    showCartModal,
    setShowCartModal,
    lastAddedProduct,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
