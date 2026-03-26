import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { LOGO_VARIANTS, type LogoVariantKey } from "@/lib/partner-variants";
import { notifyPartnerSubmission } from "@/lib/slack";
import {
  svgErrorMessage,
  validateSvgContent,
  validateSvgFile,
} from "@/lib/svg";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const companyName = String(formData.get("company_name") ?? "").trim();
  if (!companyName) {
    return NextResponse.json(
      { error: "Company name is required." },
      { status: 400 },
    );
  }

  const files: Partial<Record<LogoVariantKey, File>> = {};
  for (const v of LOGO_VARIANTS) {
    const f = formData.get(v.key);
    if (f instanceof File && f.size > 0) {
      files[v.key] = f;
    }
  }

  if (!files.primary) {
    return NextResponse.json(
      { error: "Primary logo (required) is missing." },
      { status: 400 },
    );
  }

  for (const v of LOGO_VARIANTS) {
    const file = files[v.key];
    if (!file) continue;
    const extErr = validateSvgFile(file);
    if (extErr) {
      return NextResponse.json(
        { error: `${v.label}: ${svgErrorMessage(extErr)}` },
        { status: 400 },
      );
    }
    const contentErr = await validateSvgContent(file);
    if (contentErr) {
      return NextResponse.json(
        { error: `${v.label}: ${svgErrorMessage(contentErr)}` },
        { status: 400 },
      );
    }
  }

  const supabase = createSupabaseServiceClient();

  const { data: partner, error: pErr } = await supabase
    .from("partners")
    .insert({
      company_name: companyName,
      status: "pending",
    })
    .select("id")
    .single();

  if (pErr || !partner) {
    console.error(pErr);
    return NextResponse.json(
      { error: "Could not create partner record." },
      { status: 500 },
    );
  }

  const partnerId = partner.id as string;

  const { error: cfgErr } = await supabase.from("partner_config").insert({
    partner_id: partnerId,
  });

  if (cfgErr) {
    console.error(cfgErr);
    await supabase.from("partners").delete().eq("id", partnerId);
    return NextResponse.json(
      { error: "Could not initialize partner configuration." },
      { status: 500 },
    );
  }

  const fileSummary: Record<LogoVariantKey, string | null> = {
    primary: null,
    single_color: null,
    full_color: null,
    alternate_layout: null,
  };

  for (const v of LOGO_VARIANTS) {
    const file = files[v.key];
    if (!file) continue;

    const safeName =
      file.name.replace(/[^\w.\-]+/g, "_") || `${v.key}.svg`;
    const path = `${partnerId}/${v.key}-${safeName}`;

    const buf = await file.arrayBuffer();
    const { error: upErr } = await supabase.storage
      .from("logos")
      .upload(path, buf, {
        contentType: "image/svg+xml",
        upsert: false,
      });

    if (upErr) {
      console.error(upErr);
      await supabase.from("partners").delete().eq("id", partnerId);
      return NextResponse.json(
        { error: "Could not upload files. Please try again." },
        { status: 500 },
      );
    }

    const { error: luErr } = await supabase.from("logo_uploads").insert({
      partner_id: partnerId,
      variant: v.key,
      file_path: path,
      file_name: file.name,
      is_required: v.required,
    });

    if (luErr) {
      console.error(luErr);
      await supabase.from("partners").delete().eq("id", partnerId);
      return NextResponse.json(
        { error: "Could not save upload metadata." },
        { status: 500 },
      );
    }

    fileSummary[v.key] = file.name;
  }

  await notifyPartnerSubmission({
    companyName,
    partnerId,
    files: fileSummary,
  });

  return NextResponse.json({ partnerId });
}
