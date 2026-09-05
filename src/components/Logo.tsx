import Link from "next/link";

export default function Logo({ light = false, small = false }: { light?: boolean; small?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 group" aria-label="Alpha Watch & Opticals Home">
      <img
        src="/icons/logo.svg"
        alt="Alpha Watch & Opticals"
        className={`${small ? "w-8 h-8" : "w-10 h-10"} transition-transform group-hover:rotate-6`}
      />
      <div className="leading-none">
        <div
          className={`font-serif font-bold tracking-wide transition-colors ${
            small ? "text-lg" : "text-xl"
          } ${light ? "text-ivory" : "text-[#1E3A8A] group-hover:text-[#1E40AF]"}`}
        >
          ALPHA
        </div>
        <div
          className={`uppercase tracking-[0.2em] text-[9px] mt-0.5 font-semibold transition-colors ${
            light ? "text-gold" : "text-[#1D4ED8] group-hover:text-[#1E40AF]"
          }`}
        >
          Watch &amp; Opticals
        </div>
      </div>
    </Link>
  );
}
