import Link from "next/link";
import { redirect } from "next/navigation";

import { PersonalDevelopmentComposer } from "@/components/guided-modes/personal-development-composer";
import { getCurrentUser } from "@/modules/auth/session";
import {
  getPersonalDevelopmentView,
  startNewPersonalDevelopmentSession,
} from "@/modules/guided-modes/personal-development-actions";
import {
  getPersonalDevelopmentCurrentQuestion,
  personalDevelopmentStages,
} from "@/modules/guided-modes/personal-development-flow";
import { getUserContext } from "@/modules/users/user-context";

export default async function DesarrolloPersonalPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const userContext = await getUserContext(user.id);

  if (!userContext.profile?.onboardingCompleted || !userContext.primaryAgent) {
    redirect("/onboarding");
  }

  const view = await getPersonalDevelopmentView(
    user.id,
    userContext.primaryAgent.id,
  );

  if (!view.mode || !view.session) {
    return (
      <main className="page-shell">
        <section className="auth-panel chat-panel">
          <p className="eyebrow">Modo guiado</p>
          <h1>Desarrollo personal</h1>
          <p className="supporting-text">
            Este modo no está disponible ahora mismo.
          </p>
          <Link className="secondary-link" href="/inicio">
            Volver al inicio
          </Link>
        </section>
      </main>
    );
  }

  const currentQuestion = getPersonalDevelopmentCurrentQuestion(view.progress);
  const progressLabel = view.progress.completed
    ? "Completado"
    : `${view.progress.currentStageIndex + 1}/${personalDevelopmentStages.length}`;

  return (
    <main className="page-shell">
      <section
        className="auth-panel chat-panel"
        aria-labelledby="personal-development-title"
      >
        <p className="eyebrow">Modo guiado</p>
        <h1 id="personal-development-title">{view.mode.name}</h1>
        <p className="supporting-text">
          Vamos a revisar valores, fortalezas, progreso y un siguiente paso
          pequeño sin convertir esto en terapia ni prometer cambios mágicos.
        </p>

        <dl className="compact-summary" aria-label="Progreso del modo">
          <div>
            <dt>Progreso</dt>
            <dd>{progressLabel}</dd>
          </div>
          <div>
            <dt>Estado</dt>
            <dd>{view.progress.completed ? "Cerrado" : "En curso"}</dd>
          </div>
        </dl>

        <ol className="ledger-list" aria-label="Etapas">
          {personalDevelopmentStages.map((stage, index) => {
            const isCurrent = index === view.progress.currentStageIndex;
            const isDone =
              view.progress.completed ||
              index < view.progress.currentStageIndex;

            return (
              <li key={stage.id}>
                <div>
                  <strong>{stage.title}</strong>
                  <span>
                    {isDone ? "Completado" : isCurrent ? "Actual" : "Pendiente"}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="message-list" aria-label="Mensajes del modo guiado">
          {view.messages.length > 0 ? (
            view.messages.map((message) => (
              <article
                className={`message-bubble ${message.role === "user" ? "user-message" : "assistant-message"}`}
                key={message.id}
              >
                <p>{message.content}</p>
              </article>
            ))
          ) : (
            <article className="message-bubble assistant-message">
              <p>{currentQuestion}</p>
            </article>
          )}
        </div>

        {view.progress.completed ? (
          <div className="auth-actions">
            <form action={startNewPersonalDevelopmentSession}>
              <button className="primary-button" type="submit">
                Revisar otro foco
              </button>
            </form>
            <Link className="primary-link" href="/inicio">
              Ver resumen en inicio
            </Link>
            <Link className="secondary-link" href="/conversacion">
              Volver a conversación
            </Link>
          </div>
        ) : (
          <>
            <PersonalDevelopmentComposer question={currentQuestion} />
            <div className="auth-actions">
              <Link className="secondary-link" href="/inicio">
                Salir y continuar luego
              </Link>
              <Link className="secondary-link" href="/conversacion">
                Ir a conversación libre
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
