# App Store listing & ASO — Polymerge

Everything to paste into **App Store Connect → your app → App Information /
Version**. Character limits are Apple's; counts below are within them. The
on-device app name stays **"Polymerge"** (CFBundleDisplayName); the store
*listing* name can carry keywords (below).

---

## App name  (max 30 chars)

**Recommended:** `Polymerge: Polygon Merge`  (24)

The listing name is the single strongest search-ranking signal, so it carries
the two best keywords ("polygon", "merge"). If you prefer a pure brand, use
`Polymerge` — you keep brand clarity but lose those two keywords from the
highest-weighted field.

## Subtitle  (max 30 chars)

**Recommended:** `Merge shapes, grow polygons`  (27)

Alternatives: `Endless shape-merge puzzle` (26) · `A calm 2048-style puzzle` (24)

## Keywords  (max 100 chars, comma-separated, no spaces)

```
2048,puzzle,number,tile,block,geometry,brain,logic,relax,offline,minimal,matching,casual,hexagon,IQ
```

Rules already applied: no spaces (saves characters), singular forms (Apple
auto-matches plurals), and **no words repeated** from the name/subtitle
(polygon, merge, shapes, grow) — repeating them wastes space without adding
reach. Don't add competitor/trademark names (e.g. "Threes", "2048" the brand is
borderline but "2048" as a genre term is widely used — keep or drop to taste).

## Promotional text  (max 170 chars, editable anytime, no review)

```
Merge two matching shapes and they become the next polygon — triangle, square,
pentagon… How big a polygon can you build? Calm, minimal, and fully offline.
```

## Description  (max 4000 chars)

```
Polymerge is a calm, minimal merge puzzle with one simple twist: every tile is
a regular polygon, and its value is its number of sides.

Slide the board and two matching shapes merge into the next polygon — two
triangles make a square, two squares make a pentagon, and on it goes. There's no
finish line. The whole point is one question: how big a polygon can you build?

Beautifully simple, quietly deep. A clean "drafting-table" look, satisfying
slides and merges, and a soft, musical sound for every combine. Play a quick
round in a queue or chase your all-time best for hours.

FEATURES
• Endless play — no artificial win screen, just your next-biggest polygon
• One-more-side merging: triangle → square → pentagon → … → and beyond
• A growing progress ladder that always shows the next shape to chase
• Your best score and biggest-ever polygon are saved on your device
• Gentle, synthesized sound and light haptics — with a one-tap mute
• Crisp, hand-drawn geometry that scales across every iPhone
• Fully offline. No ads. No accounts. No tracking. No data collected.

Easy to learn in seconds, hard to put down. If you like 2048, merge puzzles,
number games, or just something relaxing and elegant to fidget with, Polymerge
is for you.

Swipe. Merge. Go bigger.
```

## What's New (version 1.0)

```
First release. Merge shapes into ever-bigger polygons — how far can you get?
```

## Categories

- **Primary:** Games → Puzzle
- **Secondary:** Games → Board

## Age rating

**4+** — no objectionable content. In the questionnaire answer "None" to every
content category; not "Made for Kids" (leave the Kids category off unless you
want the extra kids-privacy obligations).

## App Privacy (the nutrition label)

Answer **"No, we do not collect data from this app."** → the label shows
**Data Not Collected**. This matches [PRIVACY.md](PRIVACY.md) and the bundled
`PrivacyInfo.xcprivacy`.

## Screenshots & app icon (in `appstore/`)

- **iPhone 6.9"** (1320×2868): `01-merge`…`05-record` — five captioned shots.
- **iPad 13"** (2048×2732): `ipad-1-merge`…`ipad-4-adds-a-side` — the app is
  universal (iPhone + iPad), so an iPad set is required and included.
- **App icon** (`app-icon-1024.png`): bold white hexagon on an indigo gradient —
  opaque 1024, already in the asset catalog. Chosen to pop in search results.

fastlane uploads all of these automatically (see [AUTOMATION.md](AUTOMATION.md)).

## Required URLs

- **Privacy Policy URL** (required): host [PRIVACY.md](PRIVACY.md) somewhere
  public and paste the link. Easiest: enable GitHub Pages on this repo, or paste
  the raw file URL. App Store Connect will not accept the app without this.
- **Support URL** (required): any page you control — a GitHub repo page, a
  simple site, or a mailto-style landing page.
- **Marketing URL** (optional): leave blank or link a landing page.

## Other listing fields

- **Bundle ID:** `com.noqyris.polymerge`
- **SKU:** `polymerge-ios-001` (any unique string; internal only)
- **Price:** Free (suggested)
- **Copyright:** `2026 Djordje Subotic`
- **Primary language:** English (U.S.). A second **English (U.K.)** localization
  is included with a *different* keyword set — a safe way to index ~2× more
  search terms for English stores (Apple doesn't support Serbian metadata; U.K.
  English reaches the same audience with extra keywords).

## ASO notes (how people find it)

- The **name** and **subtitle** are weighted far above the keyword field; that's
  why the strongest terms live there.
- The **first screenshot** drives most installs — lead with the clearest "merge
  shapes → bigger polygon" caption (see the generated `appstore/` screenshots).
- **Ratings volume** is the biggest lever after metadata. Add a gentle "enjoying
  Polymerge?" review prompt (StoreKit `SKStoreReviewController`) in a future
  update once people have played a few rounds — don't prompt on first launch.
- Revisit keywords after a few weeks using App Store Connect's "search terms"
  impressions; swap out any that bring no impressions.
