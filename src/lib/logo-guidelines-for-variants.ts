import type { LogoVariantKey } from "./partner-variants";

/**
 * Partner-facing notes distilled from internal partnership guidelines
 * (see repo `logo-guidelines.md`).
 */

export const UPLOAD_STEP_INTRO =
  "Your logo will appear in your branded portal next to the “Powered by Tiny Health” wordmark. " +
  "Upload SVGs below. Avoid very small type or dense multi-line text inside the artwork—when scaled down in the portal or on PDFs, that detail often becomes illegible.";

export const LOGO_VARIANT_GUIDELINES: Record<
  LogoVariantKey,
  readonly string[]
> = {
  primary: [
    "This is the default mark we use across splash, login, in-app navigation, and PDFs.",
    "We place it in square, long, and tall co-branded templates and resize to fit. Clear space beside your mark in lockups is typically about one-third of the logo’s height.",
    "Use the same visual sizing on splash and login (splash uses a white background only) so the transition between those screens stays smooth.",
    "In PDFs we may show your logo at 16px, 24px, or 48px height (small / medium / large) depending on layout; a “Powered by Tiny Health” line in PDFs is optional.",
  ],
  single_color: [
    "All-black or all-white vector artwork (SVG) for placements that need a single ink color.",
  ],
  full_color: [
    "Full-color vector artwork (SVG) when your brand palette is required in the product.",
  ],
  alternate_layout: [
    "Optional extra layouts—for example horizontal and vertical versions. If you have more than one, upload them so we can pick the best fit; some layouts do not work well at a very small scale.",
  ],
};
