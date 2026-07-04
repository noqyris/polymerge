# Publishing Polymerge to the App Store

Everything in the app is submission-ready. What's left needs **your** Apple
Developer account and can only be done by you (Apple requires signing in with
your Apple ID and clicking Submit). This is the exact path.

> **Prefer to automate it?** See **[AUTOMATION.md](AUTOMATION.md)** — a fastlane
> setup (already wired with all metadata + screenshots) that uploads and submits
> with a single command once you provide an App Store Connect API key. The steps
> below are the equivalent manual path.

## What's already done for you

- ✅ Bundle id `com.noqyris.polymerge`, display name **Polymerge**, portrait-locked.
- ✅ App icon is a solid 1024×1024 with **no alpha** (the #1 auto-rejection is avoided).
- ✅ `ITSAppUsesNonExemptEncryption = false` — the export-compliance question is
  pre-answered (No), so uploads don't get stuck on it.
- ✅ `PrivacyInfo.xcprivacy` bundled in the app: no tracking, no data collected,
  UserDefaults declared with reason `CA92.1`.
- ✅ Version `1.0`, build `1`.
- ✅ Marketing copy in [APPSTORE.md](APPSTORE.md), privacy policy in
  [PRIVACY.md](PRIVACY.md), and 5 screenshots (1320×2868) in [appstore/](appstore/).

## 0. Prerequisites

- **Apple Developer Program** membership ($99/year) — enroll at
  <https://developer.apple.com/programs/>.
- **Xcode** (installed) and, for the Capacitor CLI, **Node ≥ 22** (`nvm use 22`).

## 1. Build the web app and open Xcode

```sh
npm run ios:sync    # production web build → copied into ios/
npm run ios:open    # opens ios/App in Xcode
```

## 2. Set signing

In Xcode: select the **App** target → **Signing & Capabilities** →
- check **Automatically manage signing**,
- pick your **Team** (bundle id is already `com.noqyris.polymerge`).

## 3. Create the app record in App Store Connect

1. Go to <https://appstoreconnect.apple.com> → **My Apps → +→ New App**.
2. Platform **iOS**; Name = your listing name (see [APPSTORE.md](APPSTORE.md),
   e.g. `Polymerge: Polygon Merge`); Primary language **English (U.S.)**;
   Bundle ID **com.noqyris.polymerge**; SKU `polymerge-ios-001`.
   - If the bundle id isn't listed, register it first at
     <https://developer.apple.com/account/resources/identifiers> (or it appears
     automatically after your first upload).

## 4. Archive and upload the build

1. In Xcode's run-destination dropdown choose **Any iOS Device (arm64)**
   (not a simulator).
2. **Product → Archive**. When it finishes, the **Organizer** opens.
3. Select the archive → **Distribute App → App Store Connect → Upload** → keep
   the defaults → **Upload**. Processing on Apple's side takes a few minutes.

## 5. Fill in the listing (from APPSTORE.md)

In App Store Connect → your app → the **1.0** version:

- **Name / Subtitle / Promotional text / Description / Keywords** — paste from
  [APPSTORE.md](APPSTORE.md).
- **Screenshots** — drag the five PNGs from [appstore/](appstore/) into the
  **6.9" iPhone** slot (1320×2868). Apple auto-scales them for smaller iPhones,
  so this one set is enough.
- **Promotional/marketing/category**: Primary **Puzzle**, Secondary **Board**.
- **General → App Privacy**: click **Get Started** → answer **"No, we do not
  collect data"** → the label becomes **Data Not Collected**.
- **Privacy Policy URL** (required): host [PRIVACY.md](PRIVACY.md) publicly (e.g.
  turn on GitHub Pages for this repo) and paste the link.
- **Support URL** (required): any page you control.
- **Age rating**: fill the questionnaire with **None** everywhere → **4+**.
- **Build**: in the version page, **+** next to Build and pick the one you
  uploaded in step 4.
- **Pricing and Availability** → Free (or your choice), all territories.

## 6. Submit

Click **Add for Review → Submit for Review**. First reviews usually land within
a day or two. Because there's no login, no ads, and no data collection, there's
very little for review to flag.

## Shipping updates later

1. Bump the build every upload (and the version for user-facing releases):
   in Xcode → App target → **General**, raise **Build** (e.g. 1 → 2) and, for a
   new version, **Version** (e.g. 1.0 → 1.1). These map to
   `CURRENT_PROJECT_VERSION` / `MARKETING_VERSION`.
2. `npm run ios:sync`, then re-archive and upload (steps 1, 4).
3. Add a new version in App Store Connect, write "What's New", submit.

### Nice next step for discoverability

Add a StoreKit review prompt (`SKStoreReviewController.requestReview`) after a
few completed runs (never on first launch). Ratings volume is the biggest ASO
lever after your name/subtitle — see the notes at the end of
[APPSTORE.md](APPSTORE.md).
