import Link from "next/link";
import { redirect } from "next/navigation";

import { PrepareDifficultConversationComposer } from "@/components/guided-modes/prepare-difficult-conversation-composer";
import { getCurrentUser } from "@/modules/auth/session";
import {
  getPrepareDifficultConversationView,
  startNewPrepareDifficultConversationSession,
} from "@/modules/guided-modes/prepare-difficult-conversation-actions";
import {
  getPrepareDifficultConversationCurrentQuestion,
  prepareDifficultConversationStages,
} from "@/modules/guided-modes/prepare-difficult-conversation-flow";
import { getUserContext } from "@/modules/users/user-context";

export default async function ConversacionDificilPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const userContext = await getUserContext(user.id);

  if (!userContext.profile?.onboardingCompleted || !userContext.primaryAgent) {
    redirect("/onboarding");
  }

  const view = await getPrepareDifficultConversationView(
    user.id,
    userContext.primaryAgent.id,
  );

  if (!view.mode || !view.session) {
    return (
      <main className="page-shell">
        <section className="auth-panel chat-panel">
          <p className="eyebrow">Modo guiado</p>
          <h1>Preparar una conversación difícil</h1>
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

  const currentQuestion = getPrepareDifficultConversationCurrentQuestion(
    view.progress,
  );
  const progressLabel = view.progress.completed
    ? "Completado"
    : `${view.progress.currentStageIndex + 1}/${prepareDifficultConversationStages.length}`;

  return (
    <main className="page-shell">
      <section
        className="auth-panel chat-panel"
        aria-labelledby="difficult-conversation-title"
      >
        <p className="eyebrow">Modo guiado</p>
        <h1 id="difficult-conversation-title">{view.mode.name}</h1>
        <p className="supporting-text">
          Vamos a preparar una conversación con claridad, respeto y límites
          sencillos, sin intentar controlar a la otra persona.
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
          {prepareDifficultConversationStages.map((stage, index) => {
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
            <form action={startNewPrepareDifficultConversationSession}>
              <button className="primary-button" type="submit">
                Preparar otra conversación
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
            <PrepareDifficultConversationComposer question={currentQuestion} />
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
