import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'dt_auth';

// Hardcoded credentials per spec.
const VALID_USERS = [{ username: 'admin', password: 'admin123' }];

const loadUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(loadUser);
  const [hydrated] = useState(true);

  const login = useCallback((username, password) => {
    return new Promise((resolve) => {
      // Simulate latency for nicer UX.
      setTimeout(() => {
        const match = VALID_USERS.find(
          (u) =>
            u.username.toLowerCase() === String(username).toLowerCase() &&
            u.password === password
        );
        if (match) {
          const session = {
            username: match.username,
            displayName: 'Admin Workspace',
            email: 'admin@debttracker.app',
            loggedAt: new Date().toISOString(),
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
          setUser(session);
          resolve({ ok: true });
        } else {
          resolve({ ok: false, error: 'Username atau password salah.' });
        }
      }, 600);
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, hydrated }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
