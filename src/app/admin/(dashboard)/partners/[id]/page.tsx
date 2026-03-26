import { notFound } from "next/navigation";
import { PartnerDetailForm } from "@/components/admin/PartnerDetailForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type LogoUpload = {
  id: string;
  variant: string;
  file_path: string;
  file_name: string;
};

export default async function PartnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: partner, error: pErr } = await supabase
    .from("partners")
    .select("id, company_name, status, created_at, completed_at")
    .eq("id", id)
    .single();

  if (pErr || !partner) notFound();

  const { data: uploads } = await supabase
    .from("logo_uploads")
    .select("id, variant, file_path, file_name")
    .eq("partner_id", id);

  const { data: cfg } = await supabase
    .from("partner_config")
    .select("*")
    .eq("partner_id", id)
    .single();

  const withUrls: (LogoUpload & { signedUrl: string | null })[] = [];
  for (const u of uploads ?? []) {
    const { data: signed } = await supabase.storage
      .from("logos")
      .createSignedUrl(u.file_path, 3600);
    withUrls.push({
      ...u,
      signedUrl: signed?.signedUrl ?? null,
    });
  }

  return (
    <PartnerDetailForm
      partner={partner}
      uploads={withUrls}
      config={
        cfg ?? {
          cobranded_portal: false,
          powered_by_portal: false,
          kit_activation_flow: false,
          powered_by_kit_flow: false,
          pdf_required: false,
          powered_by_pdf: false,
          partner_ops_dash_id: null,
          partner_id_prod: null,
          slug: null,
          completed_by: null,
        }
      }
    />
  );
}
