# CS Day

Local-first Jackbox-style classroom game. The host laptop is the server. Phones join over a **Cloudflare quick tunnel** (`https://….trycloudflare.com`) so they get trusted HTTPS without a deploy.

No Vercel, no Supabase, no `.env`. Physics stays on the laptop; the network only carries button events and host scene changes.

## Run

```bash
npm install
npm start
```

`npm start` builds the app, serves it on `http://127.0.0.1:4173`, starts a Cloudflare quick tunnel, then opens **Host** and **View** on this machine.

- Host controls: `http://127.0.0.1:4173/host` (QR + scene / button toggles)
- Projector view: `http://127.0.0.1:4173/view` (fullscreen canvas — HDMI this window)
- Phones: scan the QR (or open `https://….trycloudflare.com/controller`)

The join URL changes every launch. Quit with Ctrl+C; the tunnel URL dies with the process.

If `cloudflared` is missing, `npm start` downloads it into `bin/`. You can also:

```bash
brew install cloudflared
# or
npm run cloudflared:fetch
```

### Dev (no tunnel)

```bash
npm run dev
```

Local only at `http://127.0.0.1:5173`. Useful for coding; phones on cellular cannot reach it.

## Event notes

- Keep the laptop awake. The tunnel and game both run on this machine.
- Open Host and View in two windows. Put View on the projector.
- Phones should use **cellular** when possible. Venue Wi-Fi with client isolation will block joins even if the tunnel is up.
- Expect about 100 controllers. There is no hard join cap.

## Layout

```
src/routes/host         Host controls + join QR
src/routes/view         Canvas game / slides
src/routes/controller   Phone pad
server/                 Local WebSocket room + /api/session
scripts/start.mjs       Build, preview, tunnel, open browsers
```
