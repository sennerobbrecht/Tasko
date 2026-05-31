# Tasko op Vercel (volledige app)

De **hele Expo-app** wordt als **website** geëxporteerd (`expo export -p web`) en gehost op Vercel. Dat is dezelfde app als op je telefoon, maar in de browser — met enkele beperkingen (geen native AR, geen QR-scanner).

## Ja — je hebt je env-vars nodig

Supabase-keys worden **tijdens de build** in de JavaScript-bundle gezet. Zonder ze start de app niet correct.

In Vercel → **Project** → **Settings** → **Environment Variables** voeg je toe (voor **Production**, **Preview** en **Development**):

| Naam | Waarde |
|------|--------|
| `EXPO_PUBLIC_SUPABASE_URL` | `https://vdxmulebtgpruxhngkjk.supabase.co` (jouw project-URL) |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | je `sb_publishable_...` key uit Supabase Dashboard → **Project Settings** → **API** |

Gebruik **alleen** de publishable key — nooit de service role of database password.

Na het toevoegen: **Redeploy** (Deployments → … → Redeploy).

Lokaal staan dezelfde variabelen in `.env.local` (niet committen).

## Deploy (eerste keer)

1. Push je repo naar GitHub.
2. [vercel.com/new](https://vercel.com/new) → import **Tasko**.
3. **Root Directory:** `.` (repo-root, **niet** `web/`).
4. Vercel leest `vercel.json` automatisch:
   - Build: `npm run build:vercel`
   - Output: `dist`
5. Zet de **Environment Variables** (zie hierboven).
6. **Deploy**.

## Map `web/` vs repo-root

| Root Directory | Wat je krijgt |
|----------------|---------------|
| `.` (standaard) | **Volledige Tasko-app** (login, kind, ouder, Supabase, …) |
| `web` | Alleen de kleine **WebAR-demo** (geen Supabase) |

Voor “de hele app” kies je dus de **repo-root**.

## Supabase-dashboard

1. Project moet **Active** zijn (niet gepauzeerd).
2. **Authentication** → **URL configuration**:
   - **Site URL:** `https://jouw-domein.vercel.app`
   - **Redirect URLs:** voeg toe:
     - `https://jouw-domein.vercel.app/**`
     - `http://localhost:8081/**` (lokaal `expo start --web`)

## Wat werkt / niet op web

| Functie | Web (Vercel) | Expo Go / native |
|---------|--------------|------------------|
| Login, gezin, taken, shop | ✅ | ✅ |
| Supabase realtime | ✅ | ✅ |
| QR-code scannen | ❌ (code intypen) | ✅ |
| Native AR (Viro) | ❌ (3D-preview) | ✅ (dev build) |
| Expo Go camera-AR | ❌ | ✅ |

## Lokaal testen vóór deploy

```bash
npm install
npm run web
```

Of productie-build:

```bash
npm run build:vercel
npx serve dist
```

## Problemen

- **Network request failed** → Supabase-project gepauzeerd; herstel in dashboard of check env-vars op Vercel.
- **Missing env var** → variabelen ontbreken bij build; redeploy na toevoegen.
- **Lege pagina** → controleer browserconsole; vaak ontbrekende env bij build.
