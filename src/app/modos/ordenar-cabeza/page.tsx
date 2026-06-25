import Link from "next/link";
import { redirect } from "next/navigation";

import { OrganizeThoughtsComposer } from "@/components/guided-modes/organize-thoughts-composer";
import { getCurrentUser } from "@/modules/auth/session";
import {
  getOrganizeThoughtsView,
  startNewOrganizeThoughtsSession,
} from "@/modules/guided-modes/organize-thoughts-actions";
import {
  getOrganizeThoughtsCurrentQuestion,
  organizeThoughtsStages,
} from "@/modules/guided-modes/organize-thoughts-flow";
import { getUserContext } from "@/modules/users/user-context";

export default async function OrdenarCabezaPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const userContext = await getUserContext(user.id);

  if (!userContext.profile?.onboardingCompleted || !userContext.primaryAgent) {
    redirect("/onboarding");
  }

  const view = await getOrganizeThoughtsView(
    user.id,
    userContext.primaryAgent.id,
  );

  if (!view.mode || !view.session) {
    return (
      <main className="page-shell">
        <section className="auth-panel chat-panel">
          <p className="eyebrow">Modo guiado</p>
          <h1>Ordenar mi cabeza</h1>
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

  const currentQuestion = getOrganizeThoughtsCurrentQuestion(view.progress);
  const progressLabel = view.progress.completed
    ? "Completado"
    : `${view.progress.currentStageIndex + 1}/${organizeThoughtsStages.length}`;

  return (
    <main className="page-shell">
      <section
        className="auth-panel chat-panel"
        aria-labelledby="organize-title"
      >
        <p className="eyebrow">Modo guiado</p>
        <h1 id="organize-title">{view.mode.name}</h1>
        <p className="supporting-text">
          Vamos a sacar lo que tienes en la cabeza y separarlo con calma:
          hechos, preocupaciones, tareas y un siguiente paso.
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
          {organizeThoughtsStages.map((stage, index) => {
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
            <form action={startNewOrganizeThoughtsSession}>
              <button className="primary-button" type="submit">
                Ordenar otra situación
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
            <OrganizeThoughtsComposer question={currentQuestion} />
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
