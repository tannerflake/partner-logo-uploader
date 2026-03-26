/** Static assets under `public/Guides from Figma/` — display order 1 → 2 → 3. */

export const LOGO_GUIDE_DIR = "Guides from Figma";

/** Filenames match exports in that folder (Figma may add extra dots/spaces). */
export const LOGO_GUIDE_FILES = ["1..png", "2. .png", "3. .png"] as const;

export function logoGuideImageSrc(filename: string): string {
  return `/${encodeURIComponent(LOGO_GUIDE_DIR)}/${encodeURIComponent(filename)}`;
}
