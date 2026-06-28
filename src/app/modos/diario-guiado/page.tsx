import Link from "next/link";
import { redirect } from "next/navigation";

import { GuidedJournalingComposer } from "@/components/guided-modes/guided-journaling-composer";
import { getCurrentUser } from "@/modules/auth/session";
import {
  getGuidedJournalingView,
  startNewGuidedJournalingSession,
} from "@/modules/guided-modes/guided-journaling-actions";
import {
  getGuidedJournalingCurrentQuestion,
  guidedJournalingStages,
} from "@/modules/guided-modes/guided-journaling-flow";
import { getUserContext } from "@/modules/users/user-context";

export default async function DiarioGuiadoPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const userContext = await getUserContext(user.id);

  if (!userContext.profile?.onboardingCompleted || !userContext.primaryAgent) {
    redirect("/onboarding");
  }

  const view = await getGuidedJournalingView(
    user.id,
    userContext.primaryAgent.id,
  );

  if (!view.mode || !view.session) {
    return (
      <main className="page-shell">
        <section className="auth-panel chat-panel">
          <p className="eyebrow">Modo guiado</p>
          <h1>Diario guiado</h1>
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

  const currentQuestion = getGuidedJournalingCurrentQuestion(view.progress);
  const progressLabel = view.progress.completed
    ? "Completado"
    : `${view.progress.currentStageIndex + 1}/${guidedJournalingStages.length}`;

  return (
    <main className="page-shell">
      <section
        className="auth-panel chat-panel"
        aria-labelledby="journaling-title"
      >
        <p className="eyebrow">Modo guiado</p>
        <h1 id="journaling-title">{view.mode.name}</h1>
        <p className="supporting-text">
          Vamos a escribir sobre una situación actual con calma, mínima
          interpretación y un cierre útil.
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
          {guidedJournalingStages.map((stage, index) => {
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
            <form action={startNewGuidedJournalingSession}>
              <button className="primary-button" type="submit">
                Escribir otra entrada
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
            <GuidedJournalingComposer question={currentQuestion} />
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
