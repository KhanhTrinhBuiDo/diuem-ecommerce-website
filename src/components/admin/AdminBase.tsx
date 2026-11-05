"use client";

import { createContext, useContext, type ReactNode } from "react";

const Ctx = createContext("");

/** Cung cấp tiền tố URL admin bí mật (vd "/ab12…") cho các component client. Giá trị đến từ server layout. */
export function AdminBaseProvider({ base, children }: { base: string; children: ReactNode }) {
  return <Ctx.Provider value={base}>{children}</Ctx.Provider>;
}
export const useAdminBase = () => useContext(Ctx);
