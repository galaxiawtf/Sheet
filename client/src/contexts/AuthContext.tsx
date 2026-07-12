import { createContext, useCallback, useContext, useEffect, useState } from "react";

/**
 * Lightweight client-side access gate for the docs.
 *
 * ⚠️ Security note: this is a *client-side* gate only. The single credential
 * lives in the bundle and anyone can bypass it via devtools, so it is NOT real
 * authentication — it just keeps casual visitors out of a public docs site.
 * Do not use this to protect anything sensitive.
 */

const STORAGE_KEY = "eli-docs-auth";
const VALID_USER = "eli";
const VALID_PASS = "eli";

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  // Keep other tabs in sync (login/logout propagates across tabs).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setIsAuthenticated(e.newValue === "1");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = useCallback((username: string, password: string) => {
    const ok =
      username.trim().toLowerCase() === VALID_USER &&
      password.trim().toLowerCase() === VALID_PASS;
    if (ok) {
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore storage failures */
      }
      setIsAuthenticated(true);
    }
    return ok;
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
