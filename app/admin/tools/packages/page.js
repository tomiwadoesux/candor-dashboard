import { requireRole, FINANCE_ROLES } from "@/lib/auth";
import { listPackages } from "@/lib/queries/packages";
import { listTalent } from "@/lib/queries/talent";
import { PageIntro, Stat } from "@/components/admin/kit";
import { PackageCreateForm, PackageList } from "@/components/admin/package-builder";

export const metadata = { title: "Package builder — Candor Admin" };

export default async function PackagesPage() {
  const profile = await requireRole("booker", "md", "ceo");
  const [packages, talent] = await Promise.all([
    listPackages(),
    listTalent({ status: "active" }),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const totalViews = packages.reduce((n, p) => n + p.viewCount, 0);

  return (
    <div>
      <PageIntro
        eyebrow="Tools · Package builder"
        meta={`${packages.length} package${packages.length === 1 ? "" : "s"}`}
        title={
          <>
            Client <span className="editorial-italic">packages</span>
          </>
        }
        lede="Curate a selection of talent for a brief and send the client one beautiful, expiring link — then watch when they look."
      />

      <div className="mt-8 grid grid-cols-2 gap-8 border-y border-border/60 py-6 md:grid-cols-3">
        <Stat label="Packages sent" value={packages.length} sub="All time" />
        <Stat label="Client views" value={totalViews} sub="Across all packages" />
        <Stat
          label="Live now"
          value={packages.filter((p) => !p.expired).length}
          sub="Links still active"
          accent="success"
        />
      </div>

      <div className="mt-10">
        <PackageCreateForm talent={talent} siteUrl={siteUrl} />
        <PackageList
          packages={packages}
          siteUrl={siteUrl}
          canDelete={FINANCE_ROLES.includes(profile.role)}
        />
      </div>
    </div>
  );
}
