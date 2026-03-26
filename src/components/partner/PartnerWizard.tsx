"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { APP_NAME } from "@/lib/app-name";
import { CobrandedExperienceInfo } from "@/components/partner/CobrandedExperienceInfo";
import {
  LOGO_VARIANT_GUIDELINES,
  UPLOAD_STEP_AVOID_BULLETS,
  UPLOAD_STEP_AVOID_LABEL,
  UPLOAD_STEP_INTRO_LEAD,
} from "@/lib/logo-guidelines-for-variants";
import { LOGO_VARIANTS, type LogoVariantKey } from "@/lib/partner-variants";
import {
  svgErrorMessage,
  validateSvgContent,
  validateSvgFile,
} from "@/lib/svg";

type Step = 1 | 2 | 3 | 4 | 5;

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
  const [previewUrls, setPreviewUrls] = useState<
    Partial<Record<LogoVariantKey, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);

  const previewUrlsRef = useRef(previewUrls);
  previewUrlsRef.current = previewUrls;

  useEffect(() => {
    return () => {
      Object.values(previewUrlsRef.current).forEach((u) => {
        if (u) URL.revokeObjectURL(u);
      });
    };
  }, []);

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
    const err = await validateAllFiles();
    if (err) {
      toast.error(err);
      return;
    }
    setStep(4);
  }

  async function submit() {
    const err = await validateAllFiles();
    if (err) {
      toast.error(err);
      return;
    }
    if (!files.primary) {
      toast.error("Primary logo is required.");
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
        toast.error(
          typeof data.error === "string" ? data.error : "Submit failed.",
        );
        return;
      }
      setStep(5);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className={`mx-auto px-5 pb-12 pt-20 sm:px-8 md:pb-16 md:pt-24 ${
        step === 2 ? "max-w-7xl" : "max-w-2xl"
      }`}
    >
      <header className="mb-10 text-center md:mb-12">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
          {APP_NAME}
        </h1>
      </header>

      {step < 5 && (
        <div className="mb-8 flex flex-wrap items-center justify-center gap-1 text-sm text-neutral-500 md:mb-10 md:text-base">
          <StepDot active={step === 1} label="Company Name" />
          <StepArrow />
          <StepDot active={step === 2} label="Info" />
          <StepArrow />
          <StepDot active={step === 3} label="Logos" />
          <StepArrow />
          <StepDot active={step === 4} label="Review" />
        </div>
      )}

      {step === 1 && (
        <section className="space-y-4 md:space-y-5">
          <label className="block">
            <span className="mb-2 block text-base font-medium text-neutral-800 md:text-lg">
              What is your company name?
            </span>
            <input
              className="w-full rounded-lg border border-neutral-300 px-4 py-3.5 text-lg text-neutral-900 shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400/40 md:px-5 md:py-4"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              autoComplete="organization"
              placeholder="Acme Corp"
            />
          </label>
          <button
            type="button"
            disabled={!canGoToUpload}
            onClick={() => setStep(2)}
            className="w-full rounded-lg bg-neutral-900 px-4 py-3.5 text-base font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 md:py-4 md:text-lg"
          >
            Continue
          </button>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-6 md:space-y-8">
          <CobrandedExperienceInfo />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 rounded-lg border border-neutral-300 bg-white py-3.5 text-base font-medium text-neutral-800 md:py-4 md:text-lg"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex-1 rounded-lg bg-neutral-900 py-3.5 text-base font-medium text-white md:py-4 md:text-lg"
            >
              Continue
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-7 md:space-y-8">
          <div className="space-y-3 text-base leading-relaxed text-neutral-600 md:text-lg">
            <p>{UPLOAD_STEP_INTRO_LEAD}</p>
            <div>
              <p className="font-medium text-neutral-700">
                {UPLOAD_STEP_AVOID_LABEL}
              </p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-neutral-500 md:text-base">
                {UPLOAD_STEP_AVOID_BULLETS.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
          {LOGO_VARIANTS.map((v) => (
            <div
              key={v.key}
              className={`rounded-xl border p-5 md:p-6 ${
                v.required
                  ? "border-amber-200 bg-amber-50/50"
                  : "border-neutral-200 bg-white"
              }`}
            >
              <div className="mb-3 flex flex-wrap items-baseline gap-2">
                <h2 className="text-lg font-medium text-neutral-900 md:text-xl">
                  {v.label}
                </h2>
                {v.required ? (
                  <span className="rounded-md bg-amber-100 px-2.5 py-0.5 text-sm font-medium text-amber-900">
                    Required
                  </span>
                ) : (
                  <span className="text-sm font-medium text-neutral-500 md:text-base">
                    Optional
                  </span>
                )}
              </div>
              <p className="mb-3 text-base leading-relaxed text-neutral-600 md:text-lg">
                {v.description}
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-500 md:text-base">
                {LOGO_VARIANT_GUIDELINES[v.key].map((line, i) => (
                  <li key={`${v.key}-${i}`}>{line}</li>
                ))}
              </ul>
              <div className="mb-4 flex min-h-[11rem] items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 md:min-h-[12.5rem]">
                {previewUrls[v.key] ? (
                  // eslint-disable-next-line @next/next/no-img-element -- blob preview of user SVG
                  <img
                    src={previewUrls[v.key]}
                    alt={`Preview of ${v.label}`}
                    className="max-h-[min(11rem,42vh)] w-full object-contain p-5 md:max-h-[min(12.5rem,45vh)] md:p-6"
                  />
                ) : (
                  <Image
                    src={v.exampleSrc}
                    alt={`Example for ${v.label}`}
                    width={560}
                    height={168}
                    className="h-auto w-full object-contain p-5 md:p-6"
                  />
                )}
              </div>
              <input
                type="file"
                accept=".svg,image/svg+xml"
                className="block w-full text-base text-neutral-700 file:mr-4 file:rounded-md file:border-0 file:bg-neutral-900 file:px-4 file:py-2.5 file:text-base file:font-medium file:text-white"
                onChange={async (e) => {
                  const f = e.target.files?.[0] ?? null;
                  const key = v.key;

                  const revokeKey = () => {
                    setPreviewUrls((prev) => {
                      const u = prev[key];
                      if (u) URL.revokeObjectURL(u);
                      const { [key]: _, ...rest } = prev;
                      return rest;
                    });
                  };

                  if (!f) {
                    revokeKey();
                    setFiles((prev) => ({ ...prev, [key]: null }));
                    return;
                  }

                  const ext = validateSvgFile(f);
                  if (ext) {
                    toast.error(`${v.label}: ${svgErrorMessage(ext)}`);
                    e.target.value = "";
                    return;
                  }
                  const c = await validateSvgContent(f);
                  if (c) {
                    toast.error(`${v.label}: ${svgErrorMessage(c)}`);
                    e.target.value = "";
                    return;
                  }

                  setPreviewUrls((prev) => {
                    const old = prev[key];
                    if (old) URL.revokeObjectURL(old);
                    return { ...prev, [key]: URL.createObjectURL(f) };
                  });
                  setFiles((prev) => ({ ...prev, [key]: f }));
                }}
              />
            </div>
          ))}
          <p className="text-sm leading-relaxed text-neutral-500 md:text-base">
            <strong className="font-medium text-neutral-700">Format:</strong>{" "}
            only <strong className="text-neutral-800">.svg</strong> files.
            Outlined artwork and correct sizing in our templates are verified
            by our design team after you submit.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex-1 rounded-lg border border-neutral-300 bg-white py-3.5 text-base font-medium text-neutral-800 md:py-4 md:text-lg"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => {
                void goToReview();
              }}
              className="flex-1 rounded-lg bg-neutral-900 py-3.5 text-base font-medium text-white md:py-4 md:text-lg"
            >
              Review
            </button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="space-y-5 md:space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 md:p-6">
            <h2 className="text-base font-medium text-neutral-500 md:text-lg">
              Company Name
            </h2>
            <p className="mt-1 text-xl font-semibold text-neutral-900 md:text-2xl">
              {companyName}
            </p>
          </div>
          <ul className="space-y-3 rounded-xl border border-neutral-200 bg-white p-5 md:p-6">
            {fileListSummary.map((row) => (
              <li
                key={row.key}
                className="flex justify-between gap-3 text-base text-neutral-800 md:text-lg"
              >
                <span>{row.label}</span>
                <span className="text-right text-neutral-600">
                  {row.file ? row.file.name : row.required ? "—" : "Not provided"}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex-1 rounded-lg border border-neutral-300 bg-white py-3.5 text-base font-medium text-neutral-800 md:py-4 md:text-lg"
            >
              Back
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void submit()}
              className="flex-1 rounded-lg bg-emerald-700 py-3.5 text-base font-medium text-white disabled:opacity-50 md:py-4 md:text-lg"
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>
          </div>
        </section>
      )}

      {step === 5 && (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center md:p-10">
          <h2 className="text-2xl font-semibold text-emerald-900 md:text-3xl">
            Thank you!
          </h2>
          <p className="mt-3 text-base leading-relaxed text-emerald-800 md:mt-4 md:text-lg">
            Thanks! We&apos;ll be in touch once we&apos;ve reviewed your assets.
          </p>
        </section>
      )}
    </div>
  );
}

function StepArrow() {
  return (
    <span className="flex shrink-0 px-0.5 text-neutral-400" aria-hidden>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="translate-y-[0.5px]"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </span>
  );
}

function StepDot({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`rounded-full px-3 py-1.5 md:px-3.5 md:py-2 ${
        active ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500"
      }`}
    >
      {label}
    </span>
  );
}
