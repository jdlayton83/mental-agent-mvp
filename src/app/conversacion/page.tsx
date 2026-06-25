import Link from "next/link";
import { redirect } from "next/navigation";

import { ConversationComposer } from "@/components/conversations/conversation-composer";
import { getCurrentUser } from "@/modules/auth/session";
import {
  getCurrentConversation,
  startPrivateConversation,
} from "@/modules/conversations/conversation-flow";
import { getCreditSummary } from "@/modules/credits/summary";
import { closeCurrentSession } from "@/modules/sessions/actions";
import { getUserContext } from "@/modules/users/user-context";

export default async function ConversacionPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const userContext = await getUserContext(user.id);

  if (!userContext.profile?.onboardingCompleted || !userContext.primaryAgent) {
    redirect("/onboarding");
  }

  const agentName =
    userContext.primaryAgent.customName ??
    userContext.primaryAgent.templateName;
  const conversation = await getCurrentConversation(
    user.id,
    userContext.primaryAgent.id,
  );
  const creditSummary = await getCreditSummary(user.id);
  const isPrivateMode = conversation.session?.privateMode ?? false;

  return (
    <main className="page-shell">
      <section className="auth-panel chat-panel" aria-labelledby="chat-title">
        <p className="eyebrow">Conversación</p>
        <h1 id="chat-title">{agentName}</h1>
        {isPrivateMode ? (
          <p className="status-note private-status">
            Modo privado activo. Al cerrar la sesión, el contenido se eliminará
            del historial normal. La seguridad y los registros técnicos mínimos
            siguen activos.
          </p>
        ) : (
          <p className="status-note">
            Conversación normal. Puedes iniciar un modo privado si no quieres
            conservar el contenido como historial ordinario.
          </p>
        )}
        <dl className="compact-summary" aria-label="Créditos">
          <div>
            <dt>Disponibles</dt>
            <dd>{creditSummary?.availableBalance ?? "Pendiente"}</dd>
          </div>
          <div>
            <dt>Reservados</dt>
            <dd>{creditSummary?.reservedBalance ?? "Pendiente"}</dd>
          </div>
        </dl>

        <div className="message-list" aria-label="Mensajes">
          {conversation.messages.length > 0 ? (
            conversation.messages.map((message) => (
              <article
                className={`message-bubble ${message.role === "user" ? "user-message" : "assistant-message"}`}
                key={message.id}
              >
                <p>{message.content}</p>
              </article>
            ))
          ) : (
            <article className="message-bubble assistant-message">
              <p>
                Hola, soy {agentName}. Puedo ayudarte a ordenar ideas, tomar una
                decisión o preparar un siguiente paso con calma.
              </p>
              {userContext.primaryAgent.mainGoal ? (
                <p>
                  Hoy podemos partir de: {userContext.primaryAgent.mainGoal}
                </p>
              ) : null}
            </article>
          )}
        </div>

        <ConversationComposer privateMode={isPrivateMode} />
        <div className="auth-actions">
          <Link className="secondary-link" href="/inicio">
            Volver al inicio
          </Link>
          {!isPrivateMode ? (
            <form action={startPrivateConversation}>
              <button className="secondary-button" type="submit">
                Iniciar modo privado
              </button>
            </form>
          ) : null}
          <form action={closeCurrentSession}>
            <button className="secondary-button" type="submit">
              Cerrar sesión
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
