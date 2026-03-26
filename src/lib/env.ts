function isLocalhostUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      u.hostname === "localhost" ||
      u.hostname === "127.0.0.1" ||
      u.hostname === "0.0.0.0"
    );
  } catch {
    return /localhost|127\.0\.0\.1/i.test(url);
  }
}

/**
 * Public base URL for server-side links (Slack, Linear, etc.).
 * Prefer a real `NEXT_PUBLIC_APP_URL` (e.g. custom domain). If that env is
 * missing or still points at localhost (common copy-paste from `.env`), use
 * `VERCEL_URL` when deployed so notifications are not stuck on localhost.
 */
export function getAppUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const explicit = raw ? raw.replace(/\/$/, "") : "";
  const vercel = process.env.VERCEL_URL?.trim();

  if (explicit && !isLocalhostUrl(explicit)) {
    return explicit;
  }

  if (vercel) {
    return `https://${vercel}`;
  }

  if (explicit) {
    return explicit;
  }

  return "http://localhost:3000";
}

export function getAdminAllowlist(): string[] {
  const raw = process.env.ADMIN_EMAIL_ALLOWLIST ?? "";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  const allow = getAdminAllowlist();
  if (allow.length === 0) return false;
  return allow.includes(email.toLowerCase());
}
