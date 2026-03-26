import { APP_NAME } from "@/lib/app-name";
import { getAppUrl } from "@/lib/env";

export type PartnerConfigRow = {
  cobranded_portal: boolean;
  powered_by_portal: boolean;
  kit_activation_flow: boolean;
  powered_by_kit_flow: boolean;
  pdf_required: boolean;
  powered_by_pdf: boolean;
  partner_ops_dash_id: string | null;
  partner_id_prod: string | null;
  slug: string | null;
};

export function shouldShowDesignTicket(cfg: PartnerConfigRow): boolean {
  return (
    cfg.cobranded_portal ||
    cfg.powered_by_portal ||
    cfg.kit_activation_flow ||
    cfg.powered_by_kit_flow ||
    cfg.pdf_required ||
    cfg.powered_by_pdf
  );
}

export function buildDesignTicketMarkdown(params: {
  companyName: string;
  partnerId: string;
  cfg: PartnerConfigRow;
}): string {
  const app = getAppUrl();
  const yn = (b: boolean) => (b ? "Yes" : "No");
  const dash = params.cfg.partner_ops_dash_id?.trim() || "—";

  return `Title: Review ${params.companyName} Logos + Specify Usage 📆 ADD DUE DATE

## Logo Placement

**Logo in results portal:**
- Cobranded results portal: ${yn(params.cfg.cobranded_portal)}
  - Powered by in results portal: ${yn(params.cfg.powered_by_portal)}
- Cobranded kit activation flow: ${yn(params.cfg.kit_activation_flow)}
  - Powered by in kit activation flow: ${yn(params.cfg.powered_by_kit_flow)}

**PDF:** ${yn(params.cfg.pdf_required)}
- Powered by in PDF can be added through a checkbox in Ops Dash

**Partner page in Ops Dash:** ${dash}

[Logo files attached — see uploaded assets in ${APP_NAME}: ${app}/admin/partners/${params.partnerId}]

---

## Requirements for Designer

- Review the logo files the partner sent and select the approved versions to use.
- Specify where each selected logo will be used (e.g. Results Portal, PDF, or both).
  - If Results Portal:
    - Choose light or dark logo per placement/station and document which one goes where.
    - If "Powered by" requirement: do the additional design work to add the powered by logo.
    - Add logos to Ops Dash.
  - If PDF: select the dark logo only and document the exact file to use.`;
}

export function buildEngTicketMarkdown(params: {
  companyName: string;
  partnerId: string;
  partnerIdProd: string;
  slug: string;
}): string {
  const app = getAppUrl();
  const prod = params.partnerIdProd.trim() || "—";
  const slug = params.slug.trim() || "—";
  return `Title: Add logo to ${params.companyName}'s PDF

Partner ID in prod: ${prod}
Slug: ${slug}

[Logo file: link to dark logo in ${APP_NAME}: ${app}/admin/partners/${params.partnerId}]`;
}
