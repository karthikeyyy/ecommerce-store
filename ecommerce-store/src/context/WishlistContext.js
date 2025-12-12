import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import axiosClient from "../api/axiosClient";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState(() => {
    try {
      const stored = localStorage.getItem("wishlist");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);

  // Fetch wishlist from backend when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchWishlist();
    } else {
      // Load from localStorage for guest users
      try {
        const stored = localStorage.getItem("wishlist");
        setWishlist(stored ? JSON.parse(stored) : []);
      } catch {
        setWishlist([]);
      }
    }
  }, [isAuthenticated, user]);

  // Save to localStorage for guest users
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist, isAuthenticated]);

  async function fetchWishlist() {
    try {
      setLoading(true);
      const res = await axiosClient.get("/wishlist");
      if (res.data?.success && res.data?.wishlist) {
        setWishlist(res.data.wishlist);
        localStorage.setItem("wishlist", JSON.stringify(res.data.wishlist));
      }
    } catch (error) {
      console.error("Fetch wishlist error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function addToWishlist(productId) {
    if (isAuthenticated) {
      try {
        const res = await axiosClient.post(`/wishlist/${productId}`);
        if (res.data?.success && res.data?.wishlist) {
          setWishlist(res.data.wishlist);
        }
      } catch (error) {
        console.error("Add to wishlist error:", error);
        // Fallback: add to local wishlist
        setWishlist(prev => {
          if (prev.some(p => p._id === productId)) return prev;
          return [...prev, { _id: productId }];
        });
      }
    } else {
      // Guest user - store product ID only
      setWishlist(prev => {
        if (prev.some(p => p._id === productId)) return prev;
        return [...prev, { _id: productId }];
      });
    }
  }

  async function removeFromWishlist(productId) {
    if (isAuthenticated) {
      try {
        const res = await axiosClient.delete(`/wishlist/${productId}`);
        if (res.data?.success && res.data?.wishlist) {
          setWishlist(res.data.wishlist);
        }
      } catch (error) {
        console.error("Remove from wishlist error:", error);
        setWishlist(prev => prev.filter(p => p._id !== productId));
      }
    } else {
      setWishlist(prev => prev.filter(p => p._id !== productId));
    }
  }

  function isInWishlist(productId) {
    return wishlist.some(p => p._id === productId);
  }

  const value = {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    fetchWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  return useContext(WishlistContext);
}
