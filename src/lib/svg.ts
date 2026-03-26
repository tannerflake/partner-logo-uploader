const SVG_MIME = "image/svg+xml";

export type SvgValidationError =
  | "empty"
  | "extension"
  | "mime"
  | "not_svg_markup"
  | "binary_or_image_header";

export function validateSvgFile(file: File): SvgValidationError | null {
  const name = file.name.toLowerCase();
  if (!name.endsWith(".svg")) return "extension";
  if (file.type && file.type !== SVG_MIME) return "mime";
  return null;
}

export async function validateSvgContent(file: File): Promise<SvgValidationError | null> {
  const text = await file.text();
  if (!text.trim()) return "empty";
  const lower = text.slice(0, 5000).toLowerCase();
  if (lower.includes("<jpeg") || lower.includes("<png") || lower.includes("ï¿½")) {
    return "binary_or_image_header";
  }
  if (!/<svg[\s>]/.test(text.trim())) return "not_svg_markup";
  return null;
}

export function svgErrorMessage(code: SvgValidationError): string {
  switch (code) {
    case "empty":
      return "File is empty.";
    case "extension":
      return "Only .svg files are accepted.";
    case "mime":
      return "File must be SVG (image/svg+xml).";
    case "not_svg_markup":
      return "File must be valid SVG text containing an <svg> tag.";
    case "binary_or_image_header":
      return "File looks like binary or a raster image, not SVG text.";
    default:
      return "Invalid SVG.";
  }
}
