import "./globals.css";
import Navbar from "@/app/components/Navbar";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-brand">
        <Navbar />
        <div className="pt-12">
          {children}
        </div>
      </body>
    </html>
  );
}
