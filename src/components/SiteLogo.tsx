import Image from "next/image";
import Link from "next/link";

export function SiteLogo() {
  return (
    <Link
      href="/"
      className="fixed left-5 top-5 z-30 block transition-opacity hover:opacity-90"
      aria-label="Home"
    >
      <Image
        src="/asdf.webp"
        alt=""
        width={280}
        height={90}
        className="h-[4.2rem] w-auto max-w-[min(62vw,280px)] object-contain object-left md:h-[4.9rem]"
        priority
      />
    </Link>
  );
}
