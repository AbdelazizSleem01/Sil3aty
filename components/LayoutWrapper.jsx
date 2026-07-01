"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminRoute && <Navbar />}
      <main className={`flex-grow ${!isAdminRoute ? "mt-6" : ""}`}>{children}</main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}
