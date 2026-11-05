import { AuthProvider } from "@/components/auth/AuthProvider";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartToast } from "@/components/cart/CartToast";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

/** Layout cửa hàng (khách): header + footer + giỏ hàng. Khu vực /admin dùng layout riêng. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <AuthProvider>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartToast />
      </AuthProvider>
    </CartProvider>
  );
}
