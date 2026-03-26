import Image from "next/image";
import {
  LOGO_GUIDE_FILES,
  logoGuideImageSrc,
} from "@/lib/logo-guide-images";

export function CobrandedExperienceInfo() {
  return (
    <section className="space-y-6 md:space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-neutral-900 md:text-2xl">
          Co-branded experience
        </h2>
        <p className="mt-2 text-base text-neutral-600 md:text-lg">
          Review the logo guides below, then continue to upload your files.
        </p>
      </div>

      <div className="mx-auto flex min-w-0 w-full max-w-[1400px] flex-col gap-8 md:gap-10">
        {LOGO_GUIDE_FILES.map((file, i) => (
          <figure
            key={file}
            className="overflow-hidden rounded-xl border border-black/10 bg-neutral-100 shadow-sm"
          >
            <Image
              src={logoGuideImageSrc(file)}
              alt={`Logo guide ${i + 1} of ${LOGO_GUIDE_FILES.length}`}
              width={1400}
              height={788}
              className="h-auto w-full object-contain"
              sizes="(max-width: 1400px) 100vw, 1400px"
              priority={i === 0}
            />
          </figure>
        ))}
      </div>
    </section>
  );
}
