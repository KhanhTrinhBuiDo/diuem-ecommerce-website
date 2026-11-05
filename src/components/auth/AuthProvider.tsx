"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { AuthModal, type AuthMode } from "@/components/auth/AuthModal";

type Ctx = { open: (mode?: AuthMode) => void; close: () => void };
const AuthContext = createContext<Ctx | null>(null);

/** Cho phép mở popup đăng nhập/đăng ký từ bất kỳ đâu (header, footer, nút "Thêm vào giỏ"...). */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AuthMode | null>(null);
  const open = useCallback((m: AuthMode = "login") => setMode(m), []);
  const close = useCallback(() => setMode(null), []);
  const value = useMemo(() => ({ open, close }), [open, close]);
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
