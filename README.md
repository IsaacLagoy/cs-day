# CS Day

Created for Texas A&M's Computer Science Day to be presented by the Texas A&M Game Developers. This application is a fake Powerpoint slide presentation that turns into a 2d platforming game. It covers educational content about game development while introducing those ideas live through the creation of a playable demo. 

## Run

```bash
npm install
npm start
```

`npm start` builds the app, serves it on `http://127.0.0.1:4173`, starts a Cloudflare quick tunnel, then opens **Host** and **View** on this machine.

- Host controls: `http://127.0.0.1:4173/host` (QR + scene / button toggles)
- Projector view: `http://127.0.0.1:4173/view` (fullscreen canvas — HDMI this window)
- Phones: scan the QR (or open `https://….trycloudflare.com/controller`)

If `cloudflared` is missing, `npm start` downloads it into `bin/`.

### Dev (no tunnel)

```bash
npm run dev
```

Local only at `http://127.0.0.1:5173`. Useful for coding; phones on cellular cannot reach it.

## Notes for presenting

- If the laptop falls asleep, the tunnel will close and the presentation will need to be restarted. 
- Has been tested with around 60 devices connected at once. 