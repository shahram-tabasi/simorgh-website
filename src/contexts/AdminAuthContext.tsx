'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type Role = 'Super Admin' | 'Admin' | 'Content Manager' | 'Marketing' | 'Editor' | 'Media Manager' | 'Sales' | 'Support';

interface Session {
  email: string;
  role: Role;
}

interface AdminAuthValue {
  session: Session | null;
  signIn: (email: string, role: Role) => void;
  signOut: () => void;
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({ children }: {children: React.ReactNode;}) {
  const [session, setSession] = useState<Session | null>(null);

  const signIn = useCallback((email: string, role: Role) => setSession({ email, role }), []);
  const signOut = useCallback(() => setSession(null), []);

  const value = useMemo(() => ({ session, signIn, signOut }), [session, signIn, signOut]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  return ctx;
}