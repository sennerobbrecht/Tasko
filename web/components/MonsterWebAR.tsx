'use client';

import '@google/model-viewer';
import { useEffect, useState } from 'react';

export function MonsterWebAR() {
  const [hasModel, setHasModel] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/models/Tasko.glb', { method: 'HEAD' })
      .then((r) => {
        if (!cancelled) setHasModel(r.ok);
      })
      .catch(() => {
        if (!cancelled) setHasModel(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (hasModel === false) {
    return (
      <div style={{ padding: '1.5rem', maxWidth: 520 }}>
        <p>
          Het model <code>Tasko.glb</code> ontbreekt in <code>web/public/models/</code>. Zorg dat{' '}
          <code>assets/3d-models/Tasko.glb</code> in de repo staat (dan kopieert{' '}
          <code>npm run build</code> het automatisch), of kopieer het handmatig naar{' '}
          <code>web/public/models/Tasko.glb</code>.
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: 720, margin: '0 auto' }}>
      {hasModel === null ? (
        <p style={{ color: 'var(--muted)' }}>Model laden…</p>
      ) : (
        // @google/model-viewer: WebXR op ondersteunde Android-browsers; Scene Viewer op veel Android-toestellen
        <model-viewer
          src="/models/Tasko.glb"
          alt="Tasko monster"
          ar
          ar-modes="webxr scene-viewer"
          camera-controls
          touch-action="pan-y"
          shadow-intensity="1"
          exposure="1"
          style={{
            width: '100%',
            height: 'min(70vh, 520px)',
            backgroundColor: '#111820',
            borderRadius: 12,
          }}
        />
      )}
    </div>
  );
}
