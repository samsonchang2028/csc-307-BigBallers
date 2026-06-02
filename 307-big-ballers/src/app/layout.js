import { Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/app/components/AppShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "OptiCart",
  description: "Compare grocery prices across local stores for Cal Poly students",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
