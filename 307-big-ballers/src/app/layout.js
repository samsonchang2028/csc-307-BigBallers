import "./globals.css";

export const metadata = {
  title: "OptiCart",
  description: "Compare grocery prices across local stores",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
