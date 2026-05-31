# Tasko WebAR-demo (Vercel)

> **Volledige Tasko-app (login, Supabase, kind/ouder)?** Deploy de **repo-root** met env-vars — zie **[VERCEL.md](../VERCEL.md)** in de projectroot.

Deze map is een **aparte** Next.js-site alleen voor **WebAR** (`Tasko.glb` via `@google/model-viewer`). Geen Supabase nodig.

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
3. Bij **Root Directory** klik **Edit** en zet: **`web`**.
4. Bij **Build & Development** → **Output Directory**: **leeg laten** (geen `dist` — anders krijg je een Next.js/dist-fout).
5. Framework: **Next.js** (automatisch).
6. **Environment Variables**: voor deze demo **niets** nodig.
7. Klik **Deploy**.

> Deploy je de **volledige app**? Gebruik dan de **repo-root** als Root Directory — zie [VERCEL.md](../VERCEL.md), niet deze map.

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
