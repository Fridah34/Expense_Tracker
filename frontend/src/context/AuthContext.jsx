import { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // On first mount, try to fetch the current user from the server.
  // WHY: the cookie is sent automatically by the browser, so if a valid
  // session exists the server returns the user. If not, it returns 401
  // which the api.js interceptor catches. Either way we end up with the
  // correct auth state without touching localStorage.
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await authAPI.getProfile({ _skipRefresh: true });
        setUser(res.data.data.user);
      } catch {
        // 401 or network error — no active session, user stays null
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    // Server sets the httpOnly cookie — we just read the user object from the body
    const { user: userData } = response.data.data;
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const response = await authAPI.register(data);
    const { user: userData } = response.data.data;
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Even if the request fails, clear local state — the user is done
    } finally {
      setUser(null);
    }
  };

  const updateUser = (updatedUser) => {
    // No localStorage to sync — just update React state
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};