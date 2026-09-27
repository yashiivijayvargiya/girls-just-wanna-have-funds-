import './globals.css';

export const metadata = {
  title: 'Order & Profit Tracker',
  description: 'Track orders, payments and profit for your handmade business.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
