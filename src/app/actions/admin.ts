"use server";

import { revalidatePath } from "next/cache";
import { isAdminEmail } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || !isAdminEmail(user.email)) {
    throw new Error("Unauthorized");
  }
  return { supabase, user };
}

export async function savePartnerConfig(
  partnerId: string,
  data: {
    cobranded_portal: boolean;
    powered_by_portal: boolean;
    kit_activation_flow: boolean;
    powered_by_kit_flow: boolean;
    pdf_required: boolean;
    powered_by_pdf: boolean;
    partner_ops_dash_id: string;
    partner_id_prod: string;
    slug: string;
  },
) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("partner_config")
    .update({
      cobranded_portal: data.cobranded_portal,
      powered_by_portal: data.powered_by_portal,
      kit_activation_flow: data.kit_activation_flow,
      powered_by_kit_flow: data.powered_by_kit_flow,
      pdf_required: data.pdf_required,
      powered_by_pdf: data.powered_by_pdf,
      partner_ops_dash_id: data.partner_ops_dash_id || null,
      partner_id_prod: data.partner_id_prod || null,
      slug: data.slug || null,
    })
    .eq("partner_id", partnerId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/partners/${partnerId}`);
}

export async function markPartnerComplete(partnerId: string) {
  const { supabase, user } = await requireAdmin();
  const now = new Date().toISOString();

  const { data: cfg, error: cfgReadErr } = await supabase
    .from("partner_config")
    .select("*")
    .eq("partner_id", partnerId)
    .single();

  if (cfgReadErr || !cfg) throw new Error("Partner config not found");

  const { error: u1 } = await supabase
    .from("partners")
    .update({
      status: "complete",
      completed_at: now,
    })
    .eq("id", partnerId);

  if (u1) throw new Error(u1.message);

  const { error: u2 } = await supabase
    .from("partner_config")
    .update({
      completed_by: user.email ?? null,
    })
    .eq("partner_id", partnerId);

  if (u2) throw new Error(u2.message);

  revalidatePath("/admin");
  revalidatePath(`/admin/partners/${partnerId}`);
}
