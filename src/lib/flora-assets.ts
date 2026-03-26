/** PNGs in `public/Individual flora images (web)/` */
export const FLORA_DIR = "Individual flora images (web)";

export const FLORA_FILES = [
  "Blue 1.png",
  "Blue 2.png",
  "Green 1.png",
  "Green 2.png",
  "Green 3.png",
  "Red 1.png",
  "Red 2.png",
  "Red 3.png",
  "Yellow 1.png",
] as const;

export function floraImageSrc(file: string): string {
  return `/${encodeURIComponent(FLORA_DIR)}/${encodeURIComponent(file)}`;
}
