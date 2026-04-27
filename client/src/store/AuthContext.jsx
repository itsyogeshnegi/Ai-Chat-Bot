import { createContext, useEffect, useMemo, useState } from "react";
import { api, setApiToken } from "../lib/api.js";
import { authStorage } from "../utils/storage.js";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => authStorage.get());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.token) {
      setApiToken(session.token);
      api
        .get("/auth/me")
        .then(({ data }) => {
          setSession((current) => ({ ...current, user: data.user }));
        })
        .catch(() => {
          authStorage.clear();
          setApiToken(null);
          setSession(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const saveSession = (payload) => {
    const next = {
      token: payload.token,
      user: payload.user
    };
    authStorage.set(next);
    setApiToken(next.token);
    setSession(next);
  };

  const login = async (values) => {
    const { data } = await api.post("/auth/login", values);
    saveSession(data);
  };

  const register = async (values) => {
    const { data } = await api.post("/auth/register", values);
    saveSession(data);
  };

  const logout = () => {
    authStorage.clear();
    setApiToken(null);
    setSession(null);
  };

  const value = useMemo(
    () => ({
      token: session?.token || null,
      user: session?.user || null,
      loading,
      isAuthenticated: Boolean(session?.token),
      login,
      register,
      logout
    }),
    [loading, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
