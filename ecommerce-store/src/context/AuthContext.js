import { createContext, useContext, useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token"); // match admin
    if (!storedToken) {
      setLoading(false);
      return;
    }

    setToken(storedToken);
    axiosClient.defaults.headers.common.Authorization = `Bearer ${storedToken}`;

    axiosClient
      .get("/me")
      .then((res) => {
        setUser(res.data?.user || null);
      })
      .catch(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        delete axiosClient.defaults.headers.common.Authorization;
      })
      .finally(() => setLoading(false));
  }, []);

  async function login({ email, password }) {
    const res = await axiosClient.post("/auth/login", { email, password });

    const t =
      res.data?.token ||
      res.data?.accessToken ||
      res.data?.data?.token;

    const u = res.data?.user || res.data?.data?.user || null;

    if (!t) throw new Error("Login failed");

    setToken(t);
    setUser(u);
    localStorage.setItem("token", t); // match admin
    axiosClient.defaults.headers.common.Authorization = `Bearer ${t}`;

    return { user: u };
  }

  async function register(payload) {
    const res = await axiosClient.post("/auth/register", payload);
    return res.data;
  }

  async function updateProfile(data) {
    const res = await axiosClient.put("/me", data);
    const updatedUser = res.data?.user || res.data?.data?.user;
    if (updatedUser) {
      setUser(updatedUser);
    }
    return updatedUser;
  }

  function logout() {
    // Cart will automatically save to localStorage via CartContext useEffect
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    delete axiosClient.defaults.headers.common.Authorization;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
