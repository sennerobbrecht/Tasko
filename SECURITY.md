# Tasko — beveiliging

## Wat goed zit

| Onderdeel | Status |
|-----------|--------|
| **Supabase-key in de app** | Alleen `EXPO_PUBLIC_*` publishable key — bedoeld om publiek te zijn |
| **Service role / DB-wachtwoord** | Niet in de app of in git (`.env.local` staat in `.gitignore`) |
| **HTTPS** | Vercel en Supabase gebruiken TLS |
| **Auth** | Ouders via Supabase Auth (e-mail/wachtwoord) |
| **Row Level Security** | Actief op o.a. `routine_assignments`; veel logica via `SECURITY DEFINER` RPC’s met checks |

De publishable key alleen geeft **geen** volledige databasetoegang: rechten komen van **RLS + RPC-logica**.

## Wat je moet weten (geen “100% hack-proof”)

1. **Keys in de browser**  
   Op Vercel staat de publishable key in de gebouwde JavaScript-bundle. Dat is normaal voor Supabase-frontends; bescherming zit in RLS, niet in geheimhouding van die key.

2. **Supabase Security Advisor**  
   Er zijn **waarschuwingen** (o.a. `SECURITY DEFINER` functies callable door `anon`/`authenticated`). Dat is gebruikelijk bij RPC’s, maar je moet per functie controleren dat er **binnen de functie** gecontroleerd wordt op gezin/kind/invite.  
   → Dashboard: **Database → Security Advisor**

3. **Aanbevolen in Supabase Dashboard**
   - **Auth → Password security**: “Leaked password protection” aanzetten
   - **Auth → URL configuration**: alleen jouw Vercel-URL(s) als redirect
   - Project **niet** lang INACTIVE laten (anders “failed to fetch”)

4. **Vercel env-vars**  
   Alleen `EXPO_PUBLIC_SUPABASE_URL` en `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — nooit service role.

## Checklist productie

- [ ] Publishable key, geen service role in Vercel
- [ ] Supabase Site URL = `https://tasko-lmat.vercel.app` (of jouw domein)
- [ ] Redirect URLs beperkt tot jouw domein
- [ ] Leaked password protection aan
- [ ] Security Advisor doorgenomen
- [ ] `.env.local` nooit committen

## Meer hardening (later)

- Striktere `REVOKE EXECUTE` op gevoelige RPC’s voor `anon` waar geen login nodig is
- `search_path` vastzetten op alle DB-functies
- Rate limiting / CAPTCHA op registratie (Supabase of edge)

Dit is een **student/MVP-niveau** setup: veilig genoeg als RLS en RPC’s kloppen, maar geen audit door security-expert.
