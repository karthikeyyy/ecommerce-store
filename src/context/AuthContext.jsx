import { createContext, useContext, useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axiosClient.defaults.headers.common["Authorization"];
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    if (user) {
      setLoading(false);
      return;
    }

    axiosClient
      .get("/me")
      .then((res) => {
        setUser(res.data?.user || null);
      })
      .catch(() => {
        setUser(null);
        setToken("");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        delete axiosClient.defaults.headers.common["Authorization"];
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (email, password) => {
    const res = await axiosClient.post("/auth/login", { email, password });
    const loggedInUser = res.data.user;
    const loggedInToken = res.data.token;

    setUser(loggedInUser);
    setToken(loggedInToken);

    localStorage.setItem("user", JSON.stringify(loggedInUser));
    localStorage.setItem("token", loggedInToken);
  };

  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete axiosClient.defaults.headers.common["Authorization"];
  };

  const hasPermission = (permission) => {
    if (!user?.permissions) return false;
    if (user.permissions.includes("*")) return true;
    return user.permissions.includes(permission);
  };

  const hasAnyPermission = (perms) => {
    if (!user?.permissions) return false;
    if (user.permissions.includes("*")) return true;
    return perms.some((p) => user.permissions.includes(p));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    hasPermission,
    hasAnyPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
