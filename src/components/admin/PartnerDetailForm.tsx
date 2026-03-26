"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { markPartnerComplete, savePartnerConfig } from "@/app/actions/admin";
import { CopyButton } from "@/components/CopyButton";
import { LOGO_VARIANTS } from "@/lib/partner-variants";
import {
  buildDesignTicketMarkdown,
  buildEngTicketMarkdown,
  shouldShowDesignTicket,
  type PartnerConfigRow,
} from "@/lib/linear-tickets";

const variantLabel = (key: string) =>
  LOGO_VARIANTS.find((v) => v.key === key)?.label ?? key;

type Partner = {
  id: string;
  company_name: string;
  status: "pending" | "in_review" | "complete";
  created_at: string;
  completed_at: string | null;
};

type Upload = {
  id: string;
  variant: string;
  file_path: string;
  file_name: string;
  signedUrl: string | null;
};

export function PartnerDetailForm({
  partner,
  uploads,
  config: initialConfig,
}: {
  partner: Partner;
  uploads: Upload[];
  config: PartnerConfigRow & { completed_by: string | null };
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [cfg, setCfg] = useState({
    cobranded_portal: initialConfig.cobranded_portal,
    powered_by_portal: initialConfig.powered_by_portal,
    kit_activation_flow: initialConfig.kit_activation_flow,
    powered_by_kit_flow: initialConfig.powered_by_kit_flow,
    pdf_required: initialConfig.pdf_required,
    powered_by_pdf: initialConfig.powered_by_pdf,
    partner_ops_dash_id: initialConfig.partner_ops_dash_id ?? "",
    partner_id_prod: initialConfig.partner_id_prod ?? "",
    slug: initialConfig.slug ?? "",
  });

  const designMd = buildDesignTicketMarkdown({
    companyName: partner.company_name,
    partnerId: partner.id,
    cfg,
  });

  const engMd = buildEngTicketMarkdown({
    companyName: partner.company_name,
    partnerId: partner.id,
    partnerIdProd: cfg.partner_id_prod.trim(),
    slug: cfg.slug.trim(),
  });

  const showDesign = shouldShowDesignTicket(cfg);

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        await savePartnerConfig(partner.id, cfg);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed");
      }
    });
  }

  function complete() {
    setError(null);
    startTransition(async () => {
      try {
        await markPartnerComplete(partner.id);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not complete");
      }
    });
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">
          {partner.company_name}
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Submitted {new Date(partner.created_at).toLocaleString()}
          {partner.completed_at && (
            <>
              {" "}
              · Completed {new Date(partner.completed_at).toLocaleString()}
            </>
          )}
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <section>
        <h2 className="text-lg font-medium text-neutral-900">Uploaded assets</h2>
        <ul className="mt-3 space-y-4">
          {uploads.map((u) => (
            <li
              key={u.id}
              className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="font-medium text-neutral-900">
                  {variantLabel(u.variant)}
                </div>
                <div className="text-sm text-neutral-600">{u.file_name}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {u.signedUrl ? (
                  <>
                    <a
                      href={u.signedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-blue-700 hover:underline"
                    >
                      Open / download
                    </a>
                    <div className="max-h-32 max-w-full overflow-hidden rounded border border-neutral-200 bg-neutral-50 p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={u.signedUrl}
                        alt={variantLabel(u.variant)}
                        className="max-h-28 w-auto object-contain"
                      />
                    </div>
                  </>
                ) : (
                  <span className="text-sm text-neutral-500">
                    Could not load preview URL.
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-neutral-900">Config</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Toggles reflect where logos may appear. Text fields are optional; add
          Ops Dash / prod IDs when you have them for handoff. Save as you go.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Toggle
            label="Cobranded results portal"
            checked={cfg.cobranded_portal}
            onChange={(v) => setCfg((c) => ({ ...c, cobranded_portal: v }))}
          />
          <Toggle
            label="Powered by in results portal"
            checked={cfg.powered_by_portal}
            onChange={(v) => setCfg((c) => ({ ...c, powered_by_portal: v }))}
          />
          <Toggle
            label="Cobranded kit activation flow"
            checked={cfg.kit_activation_flow}
            onChange={(v) => setCfg((c) => ({ ...c, kit_activation_flow: v }))}
          />
          <Toggle
            label="Powered by in kit activation flow"
            checked={cfg.powered_by_kit_flow}
            onChange={(v) => setCfg((c) => ({ ...c, powered_by_kit_flow: v }))}
          />
          <Toggle
            label="PDF required"
            checked={cfg.pdf_required}
            onChange={(v) => setCfg((c) => ({ ...c, pdf_required: v }))}
          />
          <Toggle
            label="Powered by in PDF"
            checked={cfg.powered_by_pdf}
            onChange={(v) => setCfg((c) => ({ ...c, powered_by_pdf: v }))}
          />
        </div>

        <div className="mt-6 space-y-3">
          <Field
            label="Partner page in Ops Dash"
            value={cfg.partner_ops_dash_id}
            onChange={(v) =>
              setCfg((c) => ({ ...c, partner_ops_dash_id: v }))
            }
          />
          <Field
            label="Partner ID in prod"
            value={cfg.partner_id_prod}
            onChange={(v) => setCfg((c) => ({ ...c, partner_id_prod: v }))}
          />
          <Field
            label="Slug"
            value={cfg.slug}
            onChange={(v) => setCfg((c) => ({ ...c, slug: v }))}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={save}
            className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 shadow-sm hover:bg-neutral-50 disabled:opacity-50"
          >
            Save config
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-neutral-900">Status</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Status is based only on whether this submission has been finalized.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {partner.status === "complete" ? (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-900">
              Finalized
            </span>
          ) : (
            <span className="rounded-full bg-neutral-200 px-3 py-1 text-sm font-medium text-neutral-800">
              Not finalized
            </span>
          )}
        </div>

        {partner.status !== "complete" && (
          <div className="mt-5">
            <button
              type="button"
              disabled={pending}
              onClick={complete}
              className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Mark complete + generate tickets
            </button>
          </div>
        )}
      </section>

      {partner.status === "complete" && (
        <section className="space-y-6">
          <h2 className="text-lg font-medium text-neutral-900">
            Generated Linear tickets
          </h2>
          <p className="text-sm text-neutral-600">
            Copy into Linear manually (API integration is planned for a later
            version).
          </p>

          {showDesign ? (
            <TicketBlock title="Design ticket" markdown={designMd} />
          ) : (
            <p className="text-sm text-neutral-600">
              No design ticket needed — no portal or PDF placement was enabled
              for this partner.
            </p>
          )}

          {cfg.pdf_required ? (
            <TicketBlock title="Engineering ticket (PDF)" markdown={engMd} />
          ) : (
            <p className="text-sm text-neutral-600">
              No PDF ticket needed for this partner.
            </p>
          )}

          {initialConfig.completed_by && (
            <p className="text-xs text-neutral-500">
              Completed by {initialConfig.completed_by}
            </p>
          )}
        </section>
      )}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-neutral-200 px-3 py-2">
      <span className="text-sm text-neutral-800">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 rounded-full transition-colors ${
          checked ? "bg-emerald-600" : "bg-neutral-300"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-neutral-800">{label}</span>
      <input
        className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function TicketBlock({
  title,
  markdown,
}: {
  title: string;
  markdown: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-neutral-800">{title}</h3>
        <CopyButton text={markdown} />
      </div>
      <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-800">
        {markdown}
      </pre>
    </div>
  );
}
