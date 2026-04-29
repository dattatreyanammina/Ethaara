import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setAuthToken } from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  // Ensure the api client has the token set synchronously on initialization
  // to avoid a race where child components fetch before the effect runs.
  setAuthToken(token);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const saveSession = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem("token", nextToken);
    localStorage.setItem("user", JSON.stringify(nextUser));
    setAuthToken(nextToken);
  };

  const clearSession = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthToken("");
  };

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    saveSession(data.token, data.user);
    return data;
  };

  const signup = async (payload) => {
    const { data } = await api.post("/auth/signup", payload);
    saveSession(data.token, data.user);
    return data;
  };

  const value = useMemo(
    () => ({ user, token, isAuthenticated: Boolean(token), login, signup, logout: clearSession }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
