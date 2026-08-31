// codewizards/client/src/context/AuthContext.js
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getMe, logoutUser } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  const loadUser = useCallback(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    getMe()
      .then((res) => setUser(res.data.data))
      .catch(() => clearAuth())
      .finally(() => setLoading(false));
  }, [clearAuth]);

  useEffect(() => {
    loadUser();

    const handlePageShow = () => {
      if (!localStorage.getItem("token")) {
        setUser(null);
      }
    };
    const handleSessionExpired = () => clearAuth();

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("auth:session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, [loadUser, clearAuth]);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = () => {
    // Best-effort — invalidates this user's token server-side, but local logout
    // must succeed even if the request fails (e.g. offline).
    logoutUser().catch(() => {});
    clearAuth();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, reloadUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);