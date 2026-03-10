import { createContext, useContext, useEffect, useState } from "react";
import { login as loginApi, getMe } from "../services/auth.service";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD USER FROM TOKEN ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");

    // ✅ No token → stop loading immediately
    if (!token) {
      setLoading(false);
      return;
    }

    const loadUser = async () => {
      try {
        const res = await getMe();
        setUser(res.data.user);
      } catch (error) {
        console.error("Auth error, token invalid");
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /* ================= LOGIN ================= */
  const login = async (credentials) => {
    const res = await loginApi(credentials);
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user); // ✅ user now available instantly
    return res;
  };

  /* ================= LOGOUT ================= */
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser, // 🔥 REQUIRED for avatar live update
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
