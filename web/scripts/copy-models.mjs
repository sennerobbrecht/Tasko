import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..', '..');
const src = path.join(repoRoot, 'assets', '3d-models', 'Tasko.glb');
const destDir = path.join(__dirname, '..', 'public', 'models');
const dest = path.join(destDir, 'Tasko.glb');
const isVercel = process.env.VERCEL === '1';

function fail(message) {
  console.error(`[copy-models] ${message}`);
  process.exit(1);
}

if (fs.existsSync(src)) {
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
  console.log('[copy-models] Copied Tasko.glb → web/public/models/Tasko.glb');
} else if (fs.existsSync(dest)) {
  console.log('[copy-models] Using existing web/public/models/Tasko.glb');
} else if (isVercel) {
  fail(
    'Tasko.glb ontbreekt. Commit assets/3d-models/Tasko.glb in de repo (Vercel kopieert die bij build).',
  );
} else {
  console.warn(
    '[copy-models] Geen model gevonden. Zet assets/3d-models/Tasko.glb in de repo of kopieer handmatig naar web/public/models/Tasko.glb',
  );
}
