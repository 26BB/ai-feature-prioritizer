import { Sora, Inter } from 'next/font/google';
import './globals.css';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  weight: ['300', '400', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600'],
});

export const metadata = {
  title: 'PriorityAI — AI Feature Prioritization Dashboard',
  description:
    'Input your feature ideas. Get RICE scores, effort vs impact analysis, and a sprint roadmap powered by NVIDIA AI.',
  keywords: ['AI', 'product management', 'RICE scoring', 'feature prioritization', 'roadmap'],
  openGraph: {
    title: 'PriorityAI',
    description: 'AI-powered feature prioritization for product managers',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
