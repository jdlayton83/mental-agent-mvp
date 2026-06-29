import Link from "next/link";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { getCurrentUser } from "@/modules/auth/session";
import { getUserContext } from "@/modules/users/user-context";

export default async function Home() {
  const user = await getCurrentUser();
  const userContext = user ? await getUserContext(user.id) : null;
  const destination = userContext?.profile?.onboardingCompleted
    ? "/inicio"
    : "/onboarding";

  return (
    <main className="page-shell">
      <section className="auth-panel" aria-labelledby="home-title">
        <p className="eyebrow">Mental Agent MVP</p>
        <h1 id="home-title">Acompañamiento personal no clínico</h1>
        {user ? (
          <>
            <p className="supporting-text">
              Sesión iniciada como <strong>{user.email}</strong>. Continúa con
              tu agente personal o completa la configuración inicial.
            </p>
            <div className="auth-actions">
              <Link className="primary-link" href={destination}>
                Continuar
              </Link>
              <SignOutButton />
            </div>
          </>
        ) : (
          <>
            <p className="supporting-text">
              Inicia sesión para usar el entorno local del MVP con tu agente
              personal.
            </p>
            <Link className="primary-link" href="/login">
              Entrar
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
