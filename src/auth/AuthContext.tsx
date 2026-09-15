// src/auth/AuthContext.tsx

import { createContext, useContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

type AuthContextType = {
  session: Session | null
  user: User | null
  loading: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}