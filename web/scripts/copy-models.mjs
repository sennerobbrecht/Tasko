import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..', '..');
const src = path.join(repoRoot, 'assets', '3d-models', 'Tasko.glb');
const destDir = path.join(__dirname, '..', 'public', 'models');
const dest = path.join(destDir, 'Tasko.glb');

if (fs.existsSync(src)) {
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
  console.log('[copy-models] Copied Tasko.glb to web/public/models/');
} else {
  console.warn(
    '[copy-models] Tasko.glb not found at assets/3d-models/Tasko.glb — place the file there or in web/public/models/ before deploy.'
  );
}
