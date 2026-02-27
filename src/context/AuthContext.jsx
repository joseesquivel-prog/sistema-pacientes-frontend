import { createContext, useContext, useState, useCallback } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (username, password) => {
    const data = await authService.login({ username, password });
    setToken(data.token);
    const u = { username: data.username, rol: data.rol };
    setUser(u);
    localStorage.setItem('token', data.token);
    localStorage.setItem('currentUser', JSON.stringify(u));
    return u;
  }, []);

  const registro = useCallback(async (username, password, rol) => {
    return authService.registro({ username, password, rol });
  }, []);

  const logout = useCallback(() => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, registro, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
