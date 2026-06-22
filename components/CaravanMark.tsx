import Link from "next/link";

// The Caravan platform mark — logo + wordmark, links home. Sits at the top of
// every page so the brand is consistent and the logo doubles as "home".
export default function CaravanMark() {
  return (
    <Link
      href="/"
      aria-label="Caravan — home"
      className="inline-flex items-center gap-2 transition hover:opacity-80"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/caravan-mark.png" alt="" className="h-7 w-7" />
      <span className="font-display text-lg tracking-wide text-ink">Caravan</span>
    </Link>
  );
}
