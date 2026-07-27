import { redirect } from "next/navigation";

import { SignInForm } from "@/components/auth/sign-in-form";
import { getCurrentUser } from "@/modules/auth/session";
import { getUserContext } from "@/modules/users/user-context";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{
    deleted?: string;
  }>;
}) {
  const user = await getCurrentUser();

  if (user) {
    const userContext = await getUserContext(user.id);
    redirect(
      userContext.profile?.onboardingCompleted ? "/inicio" : "/onboarding",
    );
  }

  const resolvedSearchParams = await searchParams;
  const wasDeleted = resolvedSearchParams?.deleted === "1";

  return (
    <main className="page-shell">
      <section className="auth-panel" aria-labelledby="login-title">
        <p className="eyebrow">Acceso local</p>
        <h1 id="login-title">Iniciar sesión</h1>
        <p className="supporting-text">
          Entra con el usuario de desarrollo sembrado en la base de datos.
        </p>
        {wasDeleted ? (
          <p className="supporting-text" aria-live="polite">
            La cuenta local se ha borrado y la sesión anterior ha quedado
            revocada.
          </p>
        ) : null}
        <SignInForm />
      </section>
    </main>
  );
}
