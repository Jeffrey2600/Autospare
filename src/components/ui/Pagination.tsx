import Link from "next/link";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  makeHref,
}: {
  page: number;
  totalPages: number;
  makeHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <nav className="flex items-center justify-center gap-1 py-8">
      <Link
        href={makeHref(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={cn(
          "rounded-md border border-ink-300 px-3 py-1.5 text-sm",
          page === 1 ? "pointer-events-none opacity-40" : "hover:bg-ink-50"
        )}
      >
        Prev
      </Link>
      {pages.map((p, idx) => (
        <span key={p} className="flex items-center">
          {idx > 0 && pages[idx - 1] !== p - 1 ? (
            <span className="px-1 text-ink-400">…</span>
          ) : null}
          <Link
            href={makeHref(p)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm",
              p === page
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-ink-300 hover:bg-ink-50"
            )}
          >
            {p}
          </Link>
        </span>
      ))}
      <Link
        href={makeHref(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={cn(
          "rounded-md border border-ink-300 px-3 py-1.5 text-sm",
          page === totalPages ? "pointer-events-none opacity-40" : "hover:bg-ink-50"
        )}
      >
        Next
      </Link>
    </nav>
  );
}
