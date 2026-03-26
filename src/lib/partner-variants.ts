export const LOGO_VARIANTS = [
  {
    key: "primary" as const,
    label: "Primary logo",
    required: true,
    description:
      "Your main logo in the preferred layout. This is the version we use by default.",
    exampleSrc: "/examples/primary.svg",
  },
  {
    key: "single_color" as const,
    label: "Single color version",
    required: false,
    description: "One color, no gradients — for placements that need a single ink color.",
    exampleSrc: "/examples/single-color.svg",
  },
  {
    key: "full_color" as const,
    label: "Full color version",
    required: false,
    description: "Full brand color palette when full color is required.",
    exampleSrc: "/examples/full-color.svg",
  },
  {
    key: "alternate_layout" as const,
    label: "Alternate layout",
    required: false,
    description:
      "Optional alternate such as stacked vs. horizontal, if you use more than one layout.",
    exampleSrc: "/examples/alternate-layout.svg",
  },
] as const;

export type LogoVariantKey = (typeof LOGO_VARIANTS)[number]["key"];
