//loading style that we gonna use for the whole app
import './globals.css';

export const metadata = {
  title: 'Opticart',
};

// children is just any page in our app
export default function RootLayout({ children }) {
  return (
    //general layout for whole app, so maybe we add footer in future?
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
