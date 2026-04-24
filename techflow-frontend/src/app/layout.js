import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./Context/CartContext";
import ClientLayout from "@/components/ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "TechFlow | Premium Hardware Shop",
  description: "Best computer hardware shop in Tunisia",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} scroll-smooth antialiased`}>
      <body className="bg-white min-h-screen selection:bg-blue-600 selection:text-white">
        <CartProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </CartProvider>
      </body>
    </html>
  );
}