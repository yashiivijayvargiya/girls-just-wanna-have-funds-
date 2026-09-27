import './globals.css';

export const metadata = {
  title: 'Girls Just Wanna Have Funds',
  description: 'Track orders, payments and profit — for every girl running her own business.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
