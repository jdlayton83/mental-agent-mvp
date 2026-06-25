import { redirect } from "next/navigation";

import { SignInForm } from "@/components/auth/sign-in-form";
import { getCurrentUser } from "@/modules/auth/session";
import { getUserContext } from "@/modules/users/user-context";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    const userContext = await getUserContext(user.id);
    redirect(
      userContext.profile?.onboardingCompleted ? "/inicio" : "/onboarding",
    );
  }

  return (
    <main className="page-shell">
      <section className="auth-panel" aria-labelledby="login-title">
        <p className="eyebrow">Acceso local</p>
        <h1 id="login-title">Iniciar sesión</h1>
        <p className="supporting-text">
          Entra con el usuario de desarrollo sembrado en la base de datos.
        </p>
        <SignInForm />
      </section>
    </main>
  );
}
