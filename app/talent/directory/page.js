import { DirectoryGrid } from "@/components/talent/directory/grid";
import { talent } from "@/lib/data";

const ME_ID = "1";

export default function DirectoryPage() {
  const visible = talent.filter(
    (t) => t.id === ME_ID || (t.status === "Active" && t.isPublic)
  );

  return (
    <div>
      <div className="flex items-baseline justify-between pb-2">
        <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
          Profile · Roster
        </div>
        <div className="text-[11px] text-muted-foreground">
          {visible.length} represented
        </div>
      </div>
      <h2 className="font-serif text-[34px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
        <span className="editorial-italic">Directory</span>
      </h2>
      <p className="mt-2 max-w-[56ch] text-[13px] leading-relaxed text-muted-foreground">
        The Candor roster. Instagram and X are shown — direct contact always routes
        through us.
      </p>

      <div className="mt-10">
        <DirectoryGrid talent={visible} />
      </div>
    </div>
  );
}
