import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/modules/auth/session";
import { getActiveAgentTemplates } from "@/modules/agents/agent-templates";
import { completeOnboarding } from "@/modules/agents/onboarding";

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const templates = await getActiveAgentTemplates();

  return (
    <main className="page-shell">
      <section
        className="auth-panel wide-panel"
        aria-labelledby="onboarding-title"
      >
        <p className="eyebrow">Primer ajuste</p>
        <h1 id="onboarding-title">Elige la base de tu agente</h1>
        <p className="supporting-text">
          Puedes empezar con una plantilla y personalizar el tono más adelante.
          El agente será siempre una IA de acompañamiento no clínico.
        </p>

        {templates.length > 0 ? (
          <form className="auth-form" action={completeOnboarding}>
            <fieldset className="choice-list">
              <legend>Plantilla base</legend>
              {templates.map((template, index) => (
                <label className="choice-row selectable-row" key={template.id}>
                  <input
                    defaultChecked={index === 0}
                    name="templateId"
                    type="radio"
                    value={template.id}
                  />
                  <span>
                    <strong>{template.name}</strong>
                    <small>{template.description}</small>
                  </span>
                  <dl>
                    <div>
                      <dt>Tono</dt>
                      <dd>{template.baseTone}</dd>
                    </div>
                    <div>
                      <dt>Estilo</dt>
                      <dd>{template.baseStyle}</dd>
                    </div>
                  </dl>
                </label>
              ))}
            </fieldset>

            <label className="auth-field">
              Nombre personalizado
              <input
                maxLength={120}
                name="customName"
                placeholder="Por ejemplo, Nora"
                type="text"
              />
            </label>

            <div className="form-grid">
              <label className="auth-field">
                Tono
                <select defaultValue="balanced" name="preferredTone">
                  <option value="soft">Suave</option>
                  <option value="balanced">Equilibrado</option>
                  <option value="direct">Directo</option>
                </select>
              </label>

              <label className="auth-field">
                Estilo
                <select defaultValue="practical" name="preferredStyle">
                  <option value="practical">Práctico</option>
                  <option value="reflective">Reflexivo</option>
                  <option value="inspiring">Inspirador</option>
                </select>
              </label>

              <label className="auth-field">
                Longitud
                <select defaultValue="medium" name="responseLength">
                  <option value="short">Breve</option>
                  <option value="medium">Media</option>
                  <option value="long">Detallada</option>
                </select>
              </label>

              <label className="auth-field">
                Iniciativa
                <select defaultValue="1" name="initiativeLevel">
                  <option value="0">Baja</option>
                  <option value="1">Equilibrada</option>
                  <option value="2">Alta</option>
                </select>
              </label>
            </div>

            <label className="auth-field">
              Objetivo principal
              <textarea
                maxLength={500}
                name="mainGoal"
                placeholder="Opcional"
                rows={4}
              />
            </label>

            <label className="check-row">
              <input defaultChecked name="memoryEnabled" type="checkbox" />
              <span>Activar memoria controlable</span>
            </label>

            <label className="check-row">
              <input name="aiDisclosureAccepted" required type="checkbox" />
              <span>
                Entiendo que el agente es una IA de acompañamiento no clínico.
              </span>
            </label>

            <div className="auth-actions">
              <button className="primary-button" type="submit">
                Completar onboarding
              </button>
              <Link className="secondary-link" href="/inicio">
                Volver al inicio
              </Link>
            </div>
          </form>
        ) : (
          <p className="auth-error">
            No hay plantillas activas disponibles ahora mismo.
          </p>
        )}
      </section>
    </main>
  );
}
