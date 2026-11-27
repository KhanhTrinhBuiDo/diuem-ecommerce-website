import type { Metadata } from "next";
import { AboutPage } from "@/components/about/AboutPage";

export const metadata: Metadata = { title: "Về Dịu Em", description: "Dịu dàng với em, như cách em dịu dàng với cả thế giới." };

export default function Page() {
  return <AboutPage />;
}
