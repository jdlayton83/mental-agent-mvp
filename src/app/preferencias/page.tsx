import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/modules/auth/session";
import { updatePreferences } from "@/modules/users/preferences-actions";
import { getUserContext } from "@/modules/users/user-context";

export default async function PreferenciasPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const userContext = await getUserContext(user.id);

  if (!userContext.primaryAgent) {
    redirect("/onboarding");
  }

  return (
    <main className="page-shell">
      <section
        className="auth-panel wide-panel"
        aria-labelledby="preferences-title"
      >
        <p className="eyebrow">Preferencias</p>
        <h1 id="preferences-title">Ajusta tu experiencia</h1>
        <p className="supporting-text">
          Estos ajustes cambian cómo responde tu agente. La memoria y los
          consentimientos se controlan aparte desde privacidad.
        </p>

        <form action={updatePreferences} className="auth-form">
          <div className="form-grid">
            <label className="auth-field">
              Nombre visible
              <input
                defaultValue={userContext.profile?.displayName ?? ""}
                maxLength={120}
                name="displayName"
                placeholder="Cómo quieres aparecer"
                type="text"
              />
            </label>

            <label className="auth-field">
              Nombre preferido
              <input
                defaultValue={userContext.profile?.preferredName ?? ""}
                maxLength={120}
                name="preferredName"
                placeholder="Cómo quieres que te llame"
                type="text"
              />
            </label>
          </div>

          <label className="auth-field">
            Nombre del agente
            <input
              defaultValue={userContext.primaryAgent.customName ?? ""}
              maxLength={120}
              name="customName"
              placeholder={userContext.primaryAgent.templateName}
              type="text"
            />
          </label>

          <div className="form-grid">
            <label className="auth-field">
              Tono
              <select
                defaultValue={
                  userContext.preferences?.preferredTone ??
                  userContext.primaryAgent.tone
                }
                name="preferredTone"
              >
                <option value="soft">Suave</option>
                <option value="balanced">Equilibrado</option>
                <option value="direct">Directo</option>
              </select>
            </label>

            <label className="auth-field">
              Estilo
              <select
                defaultValue={
                  userContext.preferences?.preferredStyle ??
                  userContext.primaryAgent.responseStyle
                }
                name="preferredStyle"
              >
                <option value="practical">Práctico</option>
                <option value="reflective">Reflexivo</option>
                <option value="inspiring">Inspirador</option>
              </select>
            </label>

            <label className="auth-field">
              Longitud
              <select
                defaultValue={
                  userContext.preferences?.responseLength ?? "medium"
                }
                name="responseLength"
              >
                <option value="short">Breve</option>
                <option value="medium">Media</option>
                <option value="long">Detallada</option>
              </select>
            </label>

            <label className="auth-field">
              Iniciativa
              <select
                defaultValue={String(
                  userContext.preferences?.initiativeLevel ??
                    userContext.primaryAgent.initiativeLevel,
                )}
                name="initiativeLevel"
              >
                <option value="0">Baja</option>
                <option value="1">Equilibrada</option>
                <option value="2">Alta</option>
              </select>
            </label>
          </div>

          <label className="auth-field">
            Objetivo principal
            <textarea
              defaultValue={userContext.primaryAgent.mainGoal ?? ""}
              maxLength={500}
              name="mainGoal"
              placeholder="Opcional"
              rows={4}
            />
          </label>

          <div className="auth-actions">
            <button className="primary-button" type="submit">
              Guardar preferencias
            </button>
            <Link className="secondary-link" href="/privacidad">
              Privacidad
            </Link>
            <Link className="secondary-link" href="/inicio">
              Volver al inicio
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
