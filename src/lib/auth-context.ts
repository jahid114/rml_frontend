import { createContext } from 'react';
import type { AdminRole, AdminUser } from './types';

export interface AuthSession {
  token: string;
  user: Omit<AdminUser, 'password'>;
}

export interface AuthContextValue {
  session: AuthSession | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (...roles: AdminRole[]) => boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
