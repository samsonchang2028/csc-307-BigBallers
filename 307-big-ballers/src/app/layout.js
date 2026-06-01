import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/app/components/Navbar";

export const metadata = {
  title: "OptiCart",
  description: "Compare grocery prices across local stores",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
