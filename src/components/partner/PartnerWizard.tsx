"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { LOGO_VARIANTS, type LogoVariantKey } from "@/lib/partner-variants";
import {
  svgErrorMessage,
  validateSvgContent,
  validateSvgFile,
} from "@/lib/svg";

type Step = 1 | 2 | 3 | 4;

const initialFiles = (): Partial<Record<LogoVariantKey, File | null>> => ({
  primary: null,
  single_color: null,
  full_color: null,
  alternate_layout: null,
});

export function PartnerWizard() {
  const [step, setStep] = useState<Step>(1);
  const [companyName, setCompanyName] = useState("");
  const [files, setFiles] = useState(initialFiles);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canGoToUpload = companyName.trim().length > 0;

  const fileListSummary = useMemo(() => {
    return LOGO_VARIANTS.map((v) => ({
      ...v,
      file: files[v.key],
    }));
  }, [files]);

  async function validateAllFiles(): Promise<string | null> {
    for (const v of LOGO_VARIANTS) {
      const f = files[v.key];
      if (!f) {
        if (v.required) return `${v.label} is required.`;
        continue;
      }
      const ext = validateSvgFile(f);
      if (ext) return `${v.label}: ${svgErrorMessage(ext)}`;
      const content = await validateSvgContent(f);
      if (content) return `${v.label}: ${svgErrorMessage(content)}`;
    }
    return null;
  }

  async function goToReview() {
    setError(null);
    const err = await validateAllFiles();
    if (err) {
      setError(err);
      return;
    }
    setStep(3);
  }

  async function submit() {
    setError(null);
    const err = await validateAllFiles();
    if (err) {
      setError(err);
      return;
    }
    if (!files.primary) {
      setError("Primary logo is required.");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.set("company_name", companyName.trim());
      for (const v of LOGO_VARIANTS) {
        const f = files[v.key];
        if (f) fd.set(v.key, f);
      }
      const res = await fetch("/api/partners/submit", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Submit failed.");
        return;
      }
      setStep(4);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Partner logo onboarding
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Upload your SVG logos and a few details so we can configure your brand.
        </p>
      </header>

      {step < 4 && (
        <div className="mb-6 flex justify-center gap-2 text-xs text-neutral-500">
          <StepDot active={step === 1} label="Company" />
          <StepDot active={step === 2} label="Logos" />
          <StepDot active={step === 3} label="Review" />
        </div>
      )}

      {error && (
        <div
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      )}

      {step === 1 && (
        <section className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-800">
              What is your company name?
            </span>
            <input
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              autoComplete="organization"
              placeholder="Acme Corp"
            />
          </label>
          <button
            type="button"
            disabled={!canGoToUpload}
            onClick={() => {
              setError(null);
              setStep(2);
            }}
            className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue
          </button>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-6">
          {LOGO_VARIANTS.map((v) => (
            <div
              key={v.key}
              className={`rounded-xl border p-4 ${
                v.required
                  ? "border-amber-200 bg-amber-50/50"
                  : "border-neutral-200 bg-white"
              }`}
            >
              <div className="mb-2 flex flex-wrap items-baseline gap-2">
                <h2 className="text-base font-medium text-neutral-900">
                  {v.label}
                </h2>
                {v.required ? (
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                    Required
                  </span>
                ) : (
                  <span className="text-xs font-medium text-neutral-500">
                    Optional
                  </span>
                )}
              </div>
              <p className="mb-3 text-sm text-neutral-600">{v.description}</p>
              <div className="mb-3 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                <Image
                  src={v.exampleSrc}
                  alt={`Example for ${v.label}`}
                  width={400}
                  height={120}
                  className="h-auto w-full object-contain p-4"
                />
              </div>
              <input
                type="file"
                accept=".svg,image/svg+xml"
                className="block w-full text-sm text-neutral-700 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
                onChange={async (e) => {
                  const f = e.target.files?.[0] ?? null;
                  setFiles((prev) => ({ ...prev, [v.key]: f }));
                  if (f) {
                    const ext = validateSvgFile(f);
                    if (ext) {
                      setError(`${v.label}: ${svgErrorMessage(ext)}`);
                      return;
                    }
                    const c = await validateSvgContent(f);
                    if (c) setError(`${v.label}: ${svgErrorMessage(c)}`);
                    else setError(null);
                  } else setError(null);
                }}
              />
            </div>
          ))}
          <p className="text-xs text-neutral-500">
            Only .svg files are accepted. Our design team will verify your file
            meets all technical requirements.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 rounded-lg border border-neutral-300 bg-white py-2.5 text-sm font-medium text-neutral-800"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => {
                void goToReview();
              }}
              className="flex-1 rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white"
            >
              Review
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <h2 className="text-sm font-medium text-neutral-500">Company</h2>
            <p className="text-lg font-semibold text-neutral-900">{companyName}</p>
          </div>
          <ul className="space-y-2 rounded-xl border border-neutral-200 bg-white p-4">
            {fileListSummary.map((row) => (
              <li
                key={row.key}
                className="flex justify-between gap-2 text-sm text-neutral-800"
              >
                <span>{row.label}</span>
                <span className="text-right text-neutral-600">
                  {row.file ? row.file.name : row.required ? "—" : "Not provided"}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex-1 rounded-lg border border-neutral-300 bg-white py-2.5 text-sm font-medium text-neutral-800"
            >
              Back
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void submit()}
              className="flex-1 rounded-lg bg-emerald-700 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <h2 className="text-lg font-semibold text-emerald-900">Thank you!</h2>
          <p className="mt-2 text-sm text-emerald-800">
            Thanks! We&apos;ll be in touch once we&apos;ve reviewed your assets.
          </p>
        </section>
      )}
    </div>
  );
}

function StepDot({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`rounded-full px-2 py-1 ${
        active ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500"
      }`}
    >
      {label}
    </span>
  );
}
