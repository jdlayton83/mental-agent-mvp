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
        <h1 id="home-title">Base de autenticación</h1>
        {user ? (
          <>
            <p className="supporting-text">
              Sesión iniciada como <strong>{user.email}</strong>.
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
              Inicia sesión para validar el acceso local con Auth.js.
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
