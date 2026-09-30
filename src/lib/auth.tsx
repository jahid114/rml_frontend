import { useEffect, useState, type ReactNode } from 'react';
import { SESSION_KEY } from './client';
import { AuthContext, type AuthSession } from './auth-context';

const API_URL = (import.meta.env.VITE_API_URL as string | undefined ?? 'http://localhost:3000').replace(/\/$/, '');

function readSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Fired by the API client when any request gets a 401 (expired/revoked token).
  useEffect(() => {
    const onUnauthorized = () => {
      setSession(null);
      try {
        localStorage.removeItem(SESSION_KEY);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener('rml:unauthorized', onUnauthorized);
    return () => window.removeEventListener('rml:unauthorized', onUnauthorized);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const stored = readSession();
        if (stored?.token) {
          // Revalidate against the API: expired/revoked tokens and removed or
          // demoted users all drop the session; fresh user data is picked up.
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${stored.token}` },
          });
          if (!res.ok) {
            localStorage.removeItem(SESSION_KEY);
          } else {
            const data = (await res.json()) as { user: AuthSession['user'] };
            const fresh: AuthSession = { token: stored.token, user: data.user };
            setSession(fresh);
            localStorage.setItem(SESSION_KEY, JSON.stringify(fresh));
          }
        }
      } catch {
        /* offline or unreachable API — stay logged out */
      }
      setLoading(false);
    })();
  }, []);

  const login = async (identifier: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      if (!res.ok) return false;
      const data = (await res.json()) as { token: string; user: AuthSession['user'] };
      const s: AuthSession = { token: data.token, user: data.user };
      setSession(s);
      localStorage.setItem(SESSION_KEY, JSON.stringify(s));
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const hasRole = (...roles: AuthSession['user']['role'][]) =>
    !!session && roles.includes(session.user.role);

  return (
    <AuthContext.Provider value={{ session, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}
