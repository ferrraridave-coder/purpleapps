# Voxium Website Design

## Goal

Add Voxium to Purple Apps before App Store approval so its public product page can be used as the marketing URL. The page must explain the free on-device voice, optional bring-your-own-key cloud voices, document import, and audio export without implying that Voxium is already available on the App Store.

## Approach

- Add Voxium as the first, featured homepage card, using the active reader and sleep timer image.
- Create `voxium.html` using the existing product-page structure and shared site styles.
- Use the reader and voice settings images in the hero, then explain listening controls, voice configuration, webpage cleanup, and audio export through three focused screenshot sections.
- Use a visually consistent but non-clickable "Coming soon on the App Store" CTA. Replacing it with the eventual App Store link will be a single markup edit.

## Verification

- Check desktop and mobile layouts for visual overflow and readable screenshot framing.
- Confirm the homepage card links to `voxium.html` and the unavailable-store CTA is not a link.
- Confirm the production site serves both the updated home page and the new Voxium product page after the GitHub push triggers Cloudflare deployment.
