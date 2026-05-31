import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tasko — WebAR',
  description: 'Bekijk je Tasko-monster in augmented reality in de browser (WebXR / Scene Viewer).',
  metadataBase: process.env.VERCEL_URL
    ? new URL(`https://${process.env.VERCEL_URL}`)
    : new URL('http://localhost:3000'),
  openGraph: {
    title: 'Tasko — WebAR',
    description: 'Bekijk je monster in AR op je telefoon.',
    type: 'website',
    locale: 'nl_BE',
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b0f14',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
