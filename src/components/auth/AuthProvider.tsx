"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthModal, type AuthMode } from "@/components/auth/AuthModal";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AuthUser = { id: string; email: string; name: string };
type Ctx = { open: (mode?: AuthMode) => void; close: () => void; user: AuthUser | null; loading: boolean; signOut: () => Promise<void> };
const AuthContext = createContext<Ctx | null>(null);

/** Popup đăng nhập/đăng ký dùng chung + trạng thái đăng nhập (Supabase Auth). */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AuthMode | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured());
  const open = useCallback((m: AuthMode = "login") => setMode(m), []);
  const close = useCallback(() => setMode(null), []);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const sb = createClient();
    const map = (u: { id: string; email?: string | null; user_metadata?: Record<string, unknown> } | null | undefined): AuthUser | null =>
      u ? { id: u.id, email: u.email ?? "", name: String(u.user_metadata?.full_name ?? u.user_metadata?.name ?? u.email ?? "") } : null;
    sb.auth.getUser().then(({ data }) => {
      setUser(map(data.user));
      setLoading(false);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => setUser(map(session?.user)));
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured()) await createClient().auth.signOut();
    setUser(null);
    window.location.assign("/");
  }, []);

  const value = useMemo(() => ({ open, close, user, loading, signOut }), [open, close, user, loading, signOut]);
  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal mode={mode} onModeChange={setMode} onClose={close} />
    </AuthContext.Provider>
  );
}

export function useAuthModal(): Ctx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthModal phải nằm trong <AuthProvider>");
  return ctx;
}
