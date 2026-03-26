import Link from "next/link";
import { PartnerWizard } from "@/components/partner/PartnerWizard";

export default function Home() {
  return (
    <main className="relative min-h-full bg-neutral-50 text-neutral-900">
      <PartnerWizard />
      <Link
        href="/admin/login"
        className="fixed bottom-3 right-4 z-10 text-[11px] font-normal text-neutral-400/90 underline-offset-2 hover:text-neutral-500 hover:underline"
      >
        Admin login
      </Link>
    </main>
  );
}
