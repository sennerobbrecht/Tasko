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
          Draai en zoom in de viewer. Op een ondersteunde telefoon: tik op het <strong>AR-icoon</strong> om je monster in
          de kamer te plaatsen (HTTPS vereist).
        </p>
        <ul style={{ margin: '0.75rem 0 0', paddingLeft: '1.25rem', color: 'var(--muted)', lineHeight: 1.6, fontSize: '0.9rem' }}>
          <li>Android: Chrome werkt het best (WebXR of Scene Viewer).</li>
          <li>iPhone: 3D-preview werkt; volledige AR vereist later een USDZ-bestand.</li>
          <li>De mobiele Tasko-app (Expo) is een apart product — deze site is alleen WebAR.</li>
        </ul>
      </header>
      <MonsterWebAR />
      <footer
        style={{
          marginTop: '2rem',
          textAlign: 'center',
          color: 'var(--muted)',
          fontSize: '0.8rem',
          maxWidth: 720,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        Tasko · WebAR demo
      </footer>
    </main>
  );
}
