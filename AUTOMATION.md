# Automated App Store submission

## Why not "open a browser and click through App Store Connect"

Driving the App Store Connect website with a browser bot is the wrong tool:
Apple actively blocks it, two-factor auth interrupts every session, the page
layout changes, and it violates their automation rules. It would be flaky and
could get the account flagged.

The **supported** way — and the one wired up here — is **fastlane** driven by an
**App Store Connect API key**. No browser, no password, no repeated 2FA: one key,
one command that uploads the build, all text, all screenshots, and submits for
review. fastlane 2.232 is already installed on this machine.

## Division of labor

**Only you can do these (Apple restricts them to the account holder):**

1. **Enroll** in the Apple Developer Program (once, $99/yr).
2. **Create an API key**: App Store Connect → *Users and Access* →
   *Integrations* → *App Store Connect API* → **+** → role **App Manager** →
   download `AuthKey_XXXXXXXXXX.p8` into `ios/App/fastlane/`. Note the **Key ID**
   and the **Issuer ID** at the top of that page.
3. Copy `ios/App/fastlane/.env.example` → `ios/App/fastlane/.env` and fill in
   `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_PATH`. (This file is gitignored.)
4. In Xcode once: App target → *Signing & Capabilities* → **Automatically manage
   signing** + pick your **Team** (so the build can be signed).
5. Two one-time toggles in App Store Connect that no tool sets reliably (30
   seconds total, they persist for all future versions):
   - **Age Rating** → answer *None* to everything → 4+.
   - **App Privacy** → *Data Not Collected*.
   - Accept the **Free Apps agreement** (Business → Agreements) if prompted.

**Give me these three values so the automated run doesn't ship placeholders:**

- your **Support URL** → replace `metadata/en-US/support_url.txt`
- your **Privacy Policy URL** (host [PRIVACY.md](PRIVACY.md)) → replace
  `metadata/en-US/privacy_url.txt`
- your **review phone number** → replace `metadata/review_information/phone_number.txt`

(Just tell me the values and I'll write them in; or edit the files yourself.)

**Then I run the rest** (from `ios/App/`):

```sh
fastlane create_app     # creates the app record + bundle id (once)
fastlane check          # precheck: catches common rejection reasons
# I sync the production web build into iOS first (needs Node 22):
#   (cd ../.. && npm run ios:sync)
fastlane release        # build + sign + upload binary, metadata, screenshots, submit
```

`fastlane release` uploads everything in
[ios/App/fastlane/metadata/](ios/App/fastlane/metadata/) and the five
screenshots in `ios/App/fastlane/screenshots/en-US/`, sets the export-compliance
answer (no encryption), and submits for review with automatic release on
approval.

## What each lane does

| Lane | Auth only | What it does |
|------|-----------|--------------|
| `create_app` | API key | Registers bundle id + creates the App Store Connect app record. Run once. |
| `check` | API key | `precheck` — flags common metadata rejection reasons before you submit. |
| `metadata` | API key | Pushes text + screenshots only (no binary, no submit). Handy for tweaks. |
| `release` | API key + your signing | Builds & signs, uploads the binary, pushes metadata + screenshots, submits for review. |

## The plan when you say "ajmo"

1. You confirm steps 1–5 above are done and give me the three URLs/phone.
2. I write those values in, run `npm run ios:sync`, then `fastlane create_app`
   (if needed) → `fastlane check` → `fastlane release`.
3. I report back the upload result and the review submission status.

Nothing is sent to Apple until you say go — this is all staged and waiting.
