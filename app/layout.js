import './globals.css';
import { Fraunces, DM_Sans } from 'next/font/google';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata = {
  title: 'Girls Just Wanna Have Funds',
  description:
    'Track orders, payments and profit - for everyone running their own business.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${dmSans.variable}`}>
        {children}
      </body>
    </html>
  );
}
