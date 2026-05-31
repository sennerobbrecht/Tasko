# Tasko Web (Vercel)

Next.js-site voor **WebAR** (`Tasko.glb` via `@google/model-viewer`). Los van de Expo-app in de repo-root.

## Lokaal

```bash
cd web
npm install
npm run dev
```

Open http://localhost:3000. AR test je op een **telefoon** via je LAN-IP (bijv. `http://192.168.x.x:3000`) of na deploy op Vercel (HTTPS).

## Deploy op Vercel

### Vereisten

- Git-repo (GitHub / GitLab / Bitbucket) met deze map **`web/`** én **`assets/3d-models/Tasko.glb`** gecommit.
- [Vercel-account](https://vercel.com) (gratis tier volstaat).

### Stappen

1. **Push** je code naar GitHub (of koppel je bestaande repo).
2. Ga naar [vercel.com/new](https://vercel.com/new) → **Import** je repository.
3. Bij **Root Directory** klik **Edit** en zet: **`web`** (belangrijk — niet de repo-root).
4. Framework: **Next.js** (automatisch).
5. Build settings (meestal automatisch uit `vercel.json`):
   - Install: `npm install`
   - Build: `npm run build`
6. **Environment Variables**: voor deze WebAR-demo **niets** nodig. (Supabase hoort bij de Expo-app in `.env.local` in de root.)
7. Klik **Deploy**.

Na ~1–2 minuten krijg je een URL zoals `https://tasko-xxx.vercel.app`.

### Custom domein (optioneel)

Vercel project → **Settings** → **Domains** → voeg je domein toe en volg de DNS-instructies.

### AR testen op productie

1. Open de Vercel-URL op je **telefoon** (Chrome op Android aanbevolen).
2. Wacht tot het 3D-model zichtbaar is.
3. Tik op het **AR-knopje** in de viewer.

## Veelvoorkomende problemen

| Probleem | Oplossing |
|----------|-----------|
| Build faalt: model ontbreekt | Commit `assets/3d-models/Tasko.glb` en deploy opnieuw. |
| Lege viewer | Root Directory moet **`web`** zijn, niet `.` |
| AR-knop doet niets | Gebruik HTTPS (Vercel) + Chrome Android; iOS heeft beperkte WebXR |
| Verkeerde app gebouwd | Repo-root is Expo — altijd **Root Directory = web** |

## CLI-deploy (alternatief)

```bash
cd web
npx vercel
```

Volg de prompts; kies het bestaande project of maak een nieuw. Bij link aan repo: stel in het Vercel-dashboard **Root Directory** in op `web`.
