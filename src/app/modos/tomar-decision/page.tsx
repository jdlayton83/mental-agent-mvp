import Link from "next/link";
import { redirect } from "next/navigation";

import { MakeDecisionComposer } from "@/components/guided-modes/make-decision-composer";
import { getCurrentUser } from "@/modules/auth/session";
import {
  getMakeDecisionView,
  startNewMakeDecisionSession,
} from "@/modules/guided-modes/make-decision-actions";
import {
  getMakeDecisionCurrentQuestion,
  makeDecisionStages,
} from "@/modules/guided-modes/make-decision-flow";
import { getUserContext } from "@/modules/users/user-context";

export default async function TomarDecisionPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const userContext = await getUserContext(user.id);

  if (!userContext.profile?.onboardingCompleted || !userContext.primaryAgent) {
    redirect("/onboarding");
  }

  const view = await getMakeDecisionView(user.id, userContext.primaryAgent.id);

  if (!view.mode || !view.session) {
    return (
      <main className="page-shell">
        <section className="auth-panel chat-panel">
          <p className="eyebrow">Modo guiado</p>
          <h1>Tomar una decisión</h1>
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

  const currentQuestion = getMakeDecisionCurrentQuestion(view.progress);
  const progressLabel = view.progress.completed
    ? "Completado"
    : `${view.progress.currentStageIndex + 1}/${makeDecisionStages.length}`;

  return (
    <main className="page-shell">
      <section
        className="auth-panel chat-panel"
        aria-labelledby="decision-title"
      >
        <p className="eyebrow">Modo guiado</p>
        <h1 id="decision-title">{view.mode.name}</h1>
        <p className="supporting-text">
          Trabajaremos la decisión paso a paso. Tú eliges; yo solo ayudo a
          ordenar.
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
          {makeDecisionStages.map((stage, index) => {
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
            <form action={startNewMakeDecisionSession}>
              <button className="primary-button" type="submit">
                Nueva decisión
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
            <MakeDecisionComposer question={currentQuestion} />
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
