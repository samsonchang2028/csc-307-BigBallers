import './globals.css';

export const metadata = {
  title: '307 Big Ballers',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
