import { getAppUrl } from "@/lib/env";
import type { LogoVariantKey } from "@/lib/partner-variants";

type FileSummary = Record<LogoVariantKey, string | null>;

export async function notifyPartnerSubmission(params: {
  companyName: string;
  partnerId: string;
  files: FileSummary;
}): Promise<void> {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;

  const app = getAppUrl();
  const kellyId = process.env.SLACK_KELLY_USER_ID?.trim();
  const mention = kellyId ? `<@${kellyId}> ` : "";

  const lines = [
    `${mention}— New logo assets submitted!`,
    "",
    `Company: ${params.companyName}`,
    "Files uploaded:",
    `  - Primary logo: ${params.files.primary ?? "—"} ✅`,
    `  - Single color: ${params.files.single_color ?? "Not provided"}`,
    `  - Full color: ${params.files.full_color ?? "Not provided"}`,
    `  - Alternate layout: ${params.files.alternate_layout ?? "Not provided"}`,
    "",
    `Review in admin: ${app}/admin/partners/${params.partnerId}`,
  ];

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: lines.join("\n") }),
  });

  if (!res.ok) {
    const t = await res.text();
    console.error("Slack webhook failed:", res.status, t);
  }
}
