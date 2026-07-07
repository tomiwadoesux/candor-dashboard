import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Sign in — Candor" };

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  return (
    <AuthShell
      title="Sign in"
      subtitle="Talent and team use the same door."
    >
      <LoginForm next={params.next} resetDone={params.reset === "done"} />
    </AuthShell>
  );
}
