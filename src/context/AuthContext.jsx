import { createContext, useContext, useEffect, useState } from "react";

import { getMeApi, loginApi } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khôi phục phiên đăng nhập khi mở lại app
  useEffect(() => {
    const savedToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    const savedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    if (!savedToken) {
      setLoading(false);
      return;
    }

    setToken(savedToken);

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        clearAuth();
        setLoading(false);
        return;
      }
    }

    // Kiểm tra token thực sự còn hợp lệ
    getMeApi()
      .then((currentUser) => {
        setUser(currentUser);

        const isLocalStorage = !!localStorage.getItem("token");

        if (isLocalStorage) {
          localStorage.setItem("user", JSON.stringify(currentUser));
        } else {
          sessionStorage.setItem("user", JSON.stringify(currentUser));
        }
      })
      .catch(() => {
        clearAuth();
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  const login = async (username, password, rememberMe) => {
    const data = await loginApi({
      username,
      password,
      rememberMe,
    });

    const storage = rememberMe ? localStorage : sessionStorage;

    storage.setItem("token", data.token);
    storage.setItem("user", JSON.stringify(data.user));

    // Xoá phiên cũ ở nơi còn lại
    const otherStorage = rememberMe ? sessionStorage : localStorage;

    otherStorage.removeItem("token");
    otherStorage.removeItem("user");

    setToken(data.token);
    setUser(data.user);

    return data;
  };

  const logout = () => {
    clearAuth();

    window.location.href = "/login";
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth phải được sử dụng bên trong AuthProvider");
  }

  return context;
}
