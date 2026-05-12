import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tasko — WebAR',
  description: 'Bekijk je monster in augmented reality in de browser (WebXR / Scene Viewer).',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
