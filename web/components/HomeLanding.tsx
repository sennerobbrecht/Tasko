'use client';

import dynamic from 'next/dynamic';

const MonsterWebAR = dynamic(() => import('@/components/MonsterWebAR').then((m) => m.MonsterWebAR), {
  ssr: false,
  loading: () => <p style={{ color: 'var(--muted)', textAlign: 'center' }}>Viewer laden…</p>,
});

export function HomeLanding() {
  return (
    <main style={{ padding: '1.25rem', minHeight: '100vh' }}>
      <header style={{ marginBottom: '1.5rem', maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Tasko WebAR</h1>
        <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.5 }}>
          Tik op het AR-icoon in de viewer (ondersteunde telefoon + HTTPS). Dit is los van de Expo-app: dezelfde GLB,
          browser AR via WebXR / Scene Viewer.
        </p>
      </header>
      <MonsterWebAR />
    </main>
  );
}
