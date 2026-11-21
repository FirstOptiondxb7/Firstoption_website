# FirstOption Exhibition and Events LLC – Website

One-page animated company website built from the *First Option Portfolio 2026*.

## Open it

Double-click `index.html`. No install or build step is needed.
For live reload while editing, open this folder in VS Code and use the **Live Server** extension.

## Folder structure

```
Company_Website/
├── index.html              All page text and sections
├── css/style.css           Brand colours, fonts, layout, animations
├── css/creative.css        Creative layer: loader, aurora hero, ribbons, reveals, tilt, cursor
├── js/creative.js          Creative layer: scroll effects, split headings, tilt, magnetic buttons, cursor
├── js/main.js              Typing effect, gallery + photo viewer, map, animated scenes, quote form
├── js/data.js              Lists of stand photos, event photos, client logos and map dots
└── assets/
    ├── brand/              FirstOption logo (white + navy) and the logo mark
    ├── stands/             53 stand photos taken from the portfolio
    ├── events/             16 event photos (CAAF 2023, ATM 2024, ICAO 2025, Emarat Alaman)
    ├── clients/            81 client logos
    └── scenes/             Photos for the Design / Build / Deliver scenes (AI-generated)
```

## Sections

1. **Hero**: "Your Story. Our Stand." typed on load, company profile card, rotating stand photos
2. **Our values**: mission, values, client promise
4. **How we work**: realistic photo scenes with live animation: the stand renders itself on the designer's screen, a build time-lapse in the hall, and a client meeting that ends in a handshake
5. **Stands**: photo gallery (photos only, no stand names), tap to view full screen
6. **Events**: event highlights with photos
7. **Clients**: moving logo wall
8. **Network**: animated world map, countries served, shows & venues
9. **Contact**: phones, email, website, location, and a quote form that opens WhatsApp or email

## Common edits

| What | Where |
|---|---|
| Any text | `index.html` |
| Company profile card values | `index.html` → `data-v="..."` |
| Stats (80+, 11, 100+) | `index.html` → `data-count="..."` |
| Colours | `css/style.css` → `:root` (`--accent` orange, `--brand` indigo, `--violet`) |
| Add / remove stand photos | put the .jpg in `assets/stands/` and add or remove it in `js/data.js` → `stands` |
| Add / remove client logos | `assets/clients/` + `js/data.js` → `clients` |
| WhatsApp number for the form and button | `js/main.js` (search `wa.me`) and `index.html` (search `wa.me`) |
| Chat lines in the Deliver animation | `js/main.js` → `const script = [...]` |

## Creative layer

Extra motion lives in `css/creative.css` and `js/creative.js`:
intro loader, glowing aurora and moving grid floor in the hero, floating shapes,
kinetic text ribbons (they speed up as you scroll), giant outlined words behind each section,
headings that slide in word by word, scroll reveals, photo wipe-ins, 3D tilt cards with glare,
magnetic buttons, a custom cursor ("VIEW" over photos), scroll progress bar and active menu link.

- Ribbon words: edit the two `<div class="ribbon">` blocks in `index.html`.
- Background words: `js/creative.js` → `const words = {...}`.
- To switch the whole layer off, delete the `css/creative.css` link and the `js/creative.js` script tag in `index.html`.

## Scene photos

The photos in `assets/scenes/` are AI-generated illustrations (not real staff, clients or a real build).
- `design.jpg`: designer at a workstation. The live 3D render is drawn on top of the screen area by `js/main.js` (DESIGN SCENE).
- `build-blank.jpg` + `pieces/` + `build-lit.webp`: starts from the empty hall floor, then 13 pieces cut from the finished stand photo (carpet, walls, screen, lettering, furniture, header) land one by one, and the lights switch on at the end. Piece positions are in `js/main.js` → `const PIECES`. `build-1.jpg` … `build-4.jpg` and `build-ghost.jpg` are no longer used.
- `care-1.jpg`, `care-2.jpg`: meeting, then handshake.
To swap in your own real photos, keep the same file names and a 3:2 shape. For `design.jpg`, the screen position is set in `css/style.css` → `.stage .ps-screen`.

## Notes

- Fonts load from Google Fonts. Without internet the page uses system fonts.
- Photos and logos were cut from the portfolio PDF, so the logos are only as sharp as they are there. Replace them with original logo files for a crisper logo wall.
- Visitors with "reduce motion" turned on see the finished state without animation.
