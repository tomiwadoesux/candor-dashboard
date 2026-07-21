import { preview } from "@/lib/preview/mock";
import { PageIntro } from "@/components/admin/kit";
import { TeamManagement } from "@/components/admin/team-management";
import { AdminFrame } from "@/components/preview/admin-frame";

export default function Page() {
  return (
    <AdminFrame>
      <PageIntro
        title={<>House rules</>}
        meta={`${preview.team.length} on the team`}
        lede="Who does what, and how the agency defaults fall. Team changes here ripple through every login."
      />
      <div className="mt-8">
        <TeamManagement
          team={preview.team.map((m) => ({
            id: m.id,
            full_name: m.full_name,
            email: m.email,
            role: m.role,
            is_active: m.is_active,
            created_at: m.created_at,
            last_login: m.last_login,
          }))}
          viewer={{ id: "preview-user", role: "ceo" }}
        />
      </div>
    </AdminFrame>
  );
}
