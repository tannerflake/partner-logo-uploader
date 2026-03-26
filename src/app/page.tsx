import Link from "next/link";
import { PartnerWizard } from "@/components/partner/PartnerWizard";

export default function Home() {
  return (
    <main className="relative min-h-full bg-neutral-50/78 text-neutral-900">
      <PartnerWizard />
      <Link
        href="/admin/login"
        className="fixed bottom-4 right-5 z-20 text-xs font-normal text-neutral-400/90 underline-offset-2 hover:text-neutral-500 hover:underline md:text-sm"
      >
        Admin login
      </Link>
    </main>
  );
}
