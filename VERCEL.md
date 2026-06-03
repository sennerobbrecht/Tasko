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

### `NET::ERR_CERT_COMMON_NAME_INVALID` (“verbinding is niet privé”)

Het certificaat hoort bij **`*.vercel.app`**, niet bij een andere hostnaam. De fout krijg je bijna altijd als de URL **niet exact** klopt.

**Gebruik dit (kopieer-plak):**

```
https://tasko-lmat.vercel.app
```

**Niet gebruiken:**

- `https://www.tasko-lmat.vercel.app` — **`www` werkt niet** (certificaat past niet → deze foutcode)
- `http://tasko-lmat.vercel.app` (zonder s)
- een **eigen domein** (bijv. `tasko.be`) tenzij in Vercel → Domains SSL op **Ready** staat
- een oudere / andere Vercel-URL dan je huidige project

**Check:** lang indrukken op de link → **URL kopiëren** → moet exact `https://tasko-lmat.vercel.app/...` zijn, zonder `www`.

Werkt het op **mobiele data** met die URL nog steeds? → Instellingen → **Private DNS uit** (Android) of andere filter/VPN.

### `Failed to fetch` bij registreren / inloggen

Meestal één van deze drie:

1. **Supabase-project is gepauzeerd (INACTIVE)**  
   Gratis projecten slapen na ~7 dagen zonder gebruik.  
   → [Supabase Dashboard](https://supabase.com/dashboard) → je project → **Restore project**.  
   Wacht 1–2 minuten tot status **Active** is, probeer opnieuw op [tasko-lmat.vercel.app](https://tasko-lmat.vercel.app/).

2. **Environment variables ontbreken bij de Vercel-build**  
   Keys moeten in Vercel staan **vóór** je deployt, daarna **Redeploy**.  
   Zonder keys kan de gebouwde app geen verbinding maken.

3. **Auth URL’s in Supabase**  
   Dashboard → **Authentication** → **URL configuration**:
   - Site URL: `https://tasko-lmat.vercel.app`
   - Redirect URLs: `https://tasko-lmat.vercel.app/**`

### `Next.js output directory "dist" was not found at .../web/dist`

Je **Root Directory** en **Output Directory** passen niet bij elkaar.

| Wat je wilt | Root Directory | Output Directory (Vercel dashboard) |
|-------------|----------------|-------------------------------------|
| **Volledige Tasko-app** | `.` (repo-root, leeg laten) | `dist` (of leeg — staat in `vercel.json`) |
| **Alleen WebAR (`web/`)** | `web` | **leeg** (overschrijving uitzetten) |

**Fix voor de volledige app (meest waarschijnlijk jouw bedoeling):**

1. Vercel → **Settings** → **General** → **Root Directory** → zet op **`.`** (repository root), **niet** `web`.
2. **Build & Development** → **Output Directory**: leeg laten of `dist` (Expo export).
3. **Redeploy**.

**Fix als je alleen de WebAR-demo wilt:**

1. Root Directory = `web`
2. Output Directory in het dashboard **wissen** (geen `dist` — Next.js gebruikt `.next` intern)
3. Redeploy

- **Network request failed** → Supabase-project gepauzeerd; herstel in dashboard of check env-vars op Vercel.
- **Missing env var** → variabelen ontbreken bij build; redeploy na toevoegen.
- **Lege pagina** → controleer browserconsole; vaak ontbrekende env bij build.
