# POAP local UI preview

Runs the historical issuer forms from `Think-and-Dev/poap-webapp` at upstream commit `7ca494ed69be4702e75763c531648dbd6c206d0b`.
This is the old backoffice, not the redesigned 2023+ POAP Drops app.

## Start

Requires Node.js 22 (tested with 22.14.0).

```sh
cd local-preview
npm ci --legacy-peer-deps
npm run dev
```

Open http://127.0.0.1:4173. Keep the terminal running. Use this same host consistently: browser data is origin-specific.
The setup script links the root `node_modules` to the preview dependencies when absent.

## Explore

- Manage Events: create a POAP with a PNG artwork, title, description, dates, email, and edit code.
- Manage Deliveries: create a Delivery using its Event ID and edit code. Configure page copy and recipient addresses.
- Manage Websites: Create new → Search Event by Event Id → select the POAP. Configure the shared website name, dates, times, and quantity; save and generate a QR.
- Seed POAP: Event ID `1001`, edit code `123456`, one Delivery and one Website already attached.
- Sample artwork: use the download link above the forms.
- Data persists in this browser's localStorage. The reset button restores the seed after confirmation.

## Scope

The original components and SCSS are imported unchanged. Only this preview's navigation, Auth0 replacement and local API adapter are new. It runs as a simulated administrator, with no external login. POAP API requests are handled in-browser, not sent to POAP; unimplemented endpoints fail explicitly.

This is an issuer UI sandbox. No blockchain transactions, real minting, recipient delivery, mail, server curation, or production authentication. Recipient-facing URLs are not reconstructed. The original Delivery URL still points at the historical public domain; QR URLs point at a local explanatory page.

Original quirks remain: the Website list formats minutes using the month token; after changing a Website name, reopen the editor before generating its QR to refresh the loaded name. The adapter only approximates backend validation and does not enforce edit-code authorization for simulated administrator operations.

## Verification

Verified in the browser: create a new POAP with uploaded PNG; create a Delivery with recipients; reload and retain it; edit a Website; create a Website for the newly created POAP; display QR. Vite production build also checked.

Build: `npm run build`. Preview files are separate from the historical production entry point. Do not deploy this simulated-auth sandbox as a production service.
