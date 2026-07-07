import Link from "next/link";
import { Search } from "lucide-react";
import { talentDirectory } from "@/lib/queries/community";
import { statusLabel } from "@/lib/format";
import { DirectoryGrid } from "@/components/talent/directory/grid";

const CATEGORIES = [
  "model",
  "photographer",
  "creative_director",
  "visual_artist",
  "artisan",
  "graphic_designer",
  "content_creator",
  "influencer",
  "brand_partner",
  "educator",
];

export default async function DirectoryPage({ searchParams }) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const category =
    typeof params.category === "string" && CATEGORIES.includes(params.category)
      ? params.category
      : "";

  const roster = await talentDirectory({
    q: q || undefined,
    category: category || undefined,
  });

  const chipHref = (cat) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (cat) sp.set("category", cat);
    const s = sp.toString();
    return s ? `/talent/directory?${s}` : "/talent/directory";
  };

  return (
    <div>
      <div className="flex items-baseline justify-between pb-2 pt-2">
        <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
          Profile · Roster
        </div>
        <div className="text-[11px] text-muted-foreground">
          {roster.length} represented
        </div>
      </div>
      <h2 className="font-serif text-[34px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
        <span className="editorial-italic">Directory</span>
      </h2>
      <p className="mt-2 max-w-[56ch] text-[13px] leading-relaxed text-muted-foreground">
        The Candor roster. Instagram is shown — direct contact always routes
        through us.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <form
          action="/talent/directory"
          className="relative flex h-9 min-w-[220px] flex-1 items-center gap-2 rounded-full border border-border bg-surface-muted px-3 transition-colors focus-within:border-border-strong focus-within:bg-surface"
        >
          {category && <input type="hidden" name="category" value={category} />}
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search the roster…"
            className="h-full flex-1 bg-transparent text-[12.5px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
        </form>

        <div className="flex flex-wrap items-center gap-1">
          <Chip href={chipHref("")} active={!category}>
            All
          </Chip>
          {CATEGORIES.map((cat) => (
            <Chip key={cat} href={chipHref(cat)} active={category === cat}>
              {statusLabel(cat)}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <DirectoryGrid roster={roster} q={q} />
      </div>
    </div>
  );
}

function Chip({ href, active, children }) {
  return (
    <Link
      href={href}
      className={`h-7 rounded-full px-3 text-[12px] font-medium leading-7 transition-colors ${
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}
