import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Role = 'super_admin' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  role: Role;
  prefix?: string;
  mustChangePassword?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string; user?: AuthUser }>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ ok: boolean; error?: string }>;
  superInvoke: (action: string, data?: any) => Promise<any>;
  adminInvoke: (action: string, data?: any) => Promise<any>;
}

const TOKEN_KEY = 'eurotransit_rbac_token';
const USER_KEY = 'eurotransit_rbac_user';

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  const persist = (t: string, u: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const { data: res, error } = await supabase.functions.invoke('auth-api', {
        body: { action: 'login', data: { username, password } },
      });
      if (error || !res?.token) {
        return { ok: false, error: res?.error || 'Invalid credentials' };
      }
      const u: AuthUser = {
        id: res.id,
        name: res.name,
        role: res.role,
        prefix: res.prefix,
        mustChangePassword: res.mustChangePassword,
      };
      persist(res.token, u);
      return { ok: true, user: u };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }, []);

  const invoke = useCallback(async (fn: string, action: string, data?: any) => {
    const t = token ?? localStorage.getItem(TOKEN_KEY);
    const { data: res, error } = await supabase.functions.invoke(fn, {
      body: { action, data },
      headers: t ? { Authorization: `Bearer ${t}` } : undefined,
    });
    if (error) {
      if ((error as any).context?.status === 401) logout();
      throw error;
    }
    return res;
  }, [token, logout]);

  const superInvoke = useCallback((action: string, data?: any) => invoke('super-admin-api', action, data), [invoke]);
  const adminInvoke = useCallback((action: string, data?: any) => invoke('admin-space-api', action, data), [invoke]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      const t = token ?? localStorage.getItem(TOKEN_KEY);
      const { data: res, error } = await supabase.functions.invoke('auth-api', {
        body: { action: 'changePassword', data: { currentPassword, newPassword } },
        headers: t ? { Authorization: `Bearer ${t}` } : undefined,
      });
      if (error || res?.error) return { ok: false, error: res?.error || 'Failed to change password' };
      if (user) {
        const u = { ...user, mustChangePassword: false };
        setUser(u);
        localStorage.setItem(USER_KEY, JSON.stringify(u));
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }, [token, user]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, changePassword, superInvoke, adminInvoke }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};