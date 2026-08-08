import { Playfair_Display, Space_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import PwaInstallPrompt from './components/PwaInstallPrompt';
import { AuthProvider } from '@/context/AuthContext';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['600', '700', '800', '900'],
  style: ['normal', 'italic'],
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '700'],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body-sans',
  weight: ['400', '500', '600', '700'],
});

export const metadata = {
  title: 'PriorityAI — AI Feature Prioritization Dashboard',
  description:
    'Input your feature ideas. Get RICE scores, effort vs impact analysis, and a sprint roadmap powered by NVIDIA AI.',
  keywords: ['AI', 'product management', 'RICE scoring', 'feature prioritization', 'roadmap'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PriorityAI',
  },
  openGraph: {
    title: 'PriorityAI',
    description: 'AI-powered feature prioritization for product managers',
    type: 'website',
  },
};

export const viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${spaceMono.variable} ${jakarta.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FAF4EC" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PriorityAI" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body>
        <AuthProvider>
          {children}
          <PwaInstallPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}
