import Link from "next/link";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { getCurrentUser } from "@/modules/auth/session";
import {
  archiveCommitment,
  completeCommitment,
  createCommitmentFromNextStep,
} from "@/modules/commitments/actions";
import { getRecentActiveCommitments } from "@/modules/commitments/summary";
import { requireRequiredConsents } from "@/modules/consent/required-consents";
import { startPrivateConversation } from "@/modules/conversations/conversation-flow";
import {
  getCreditSummary,
  getRecentCreditTransactions,
} from "@/modules/credits/summary";
import { confirmMemory, rejectMemory } from "@/modules/memory/actions";
import {
  getRecentConfirmedMemories,
  getRecentProposedMemories,
} from "@/modules/memory/summary";
import { submitSessionFeedback } from "@/modules/sessions/feedback-actions";
import { getRecentSessionSummaries } from "@/modules/sessions/summary";
import { getRecentUsageEvents } from "@/modules/usage/summary";
import { getUserContext } from "@/modules/users/user-context";

export default async function InicioPage({
  searchParams,
}: {
  searchParams?: Promise<{
    feedback?: string;
  }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await requireRequiredConsents(user.id);

  const resolvedSearchParams = await searchParams;
  const feedbackStatusMessage = getFeedbackStatusMessage(
    resolvedSearchParams?.feedback,
  );
  const userContext = await getUserContext(user.id);
  const creditSummary = await getCreditSummary(user.id);
  const recentCreditTransactions = await getRecentCreditTransactions(user.id);
  const recentConfirmedMemories = await getRecentConfirmedMemories(user.id);
  const recentProposedMemories = await getRecentProposedMemories(user.id);
  const recentSessionSummaries = await getRecentSessionSummaries(user.id);
  const recentActiveCommitments = await getRecentActiveCommitments(user.id);
  const recentUsageEvents = await getRecentUsageEvents(user.id);
  const displayName =
    userContext.profile?.displayName ??
    userContext.profile?.preferredName ??
    user.email ??
    "Usuario";

  return (
    <main className="page-shell">
      <section className="auth-panel wide-panel" aria-labelledby="inicio-title">
        <p className="eyebrow">Área privada</p>
        <h1 id="inicio-title">Hola, {displayName}</h1>
        <p className="supporting-text">
          Has accedido como <strong>{user.email}</strong>. Estos datos se leen
          desde tu perfil y preferencias.
        </p>
        {feedbackStatusMessage ? (
          <p className="status-note" aria-live="polite">
            {feedbackStatusMessage}
          </p>
        ) : null}
        <dl className="profile-summary">
          <div>
            <dt>Idioma</dt>
            <dd>{userContext.profile?.languageCode ?? "Pendiente"}</dd>
          </div>
          <div>
            <dt>Zona horaria</dt>
            <dd>{userContext.profile?.timezone ?? "Pendiente"}</dd>
          </div>
          <div>
            <dt>Perfil inicial</dt>
            <dd>
              {userContext.profile?.onboardingCompleted
                ? "Completado"
                : "Pendiente"}
            </dd>
          </div>
          <div>
            <dt>Memoria</dt>
            <dd>
              {userContext.preferences?.memoryEnabled
                ? "Activada"
                : "Pendiente"}
            </dd>
          </div>
          <div>
            <dt>Agente</dt>
            <dd>
              {userContext.primaryAgent
                ? (userContext.primaryAgent.customName ??
                  userContext.primaryAgent.templateName)
                : "Pendiente"}
            </dd>
          </div>
          <div>
            <dt>Estilo</dt>
            <dd>
              {userContext.primaryAgent
                ? formatAgentStyle(userContext.primaryAgent.responseStyle)
                : "Pendiente"}
            </dd>
          </div>
          <div>
            <dt>Tono</dt>
            <dd>
              {userContext.primaryAgent
                ? formatAgentTone(userContext.primaryAgent.tone)
                : "Pendiente"}
            </dd>
          </div>
          <div>
            <dt>Longitud</dt>
            <dd>
              {userContext.preferences
                ? formatResponseLength(userContext.preferences.responseLength)
                : "Pendiente"}
            </dd>
          </div>
          <div>
            <dt>Iniciativa</dt>
            <dd>
              {userContext.preferences
                ? formatInitiativeLevel(userContext.preferences.initiativeLevel)
                : "Pendiente"}
            </dd>
          </div>
          <div>
            <dt>Créditos disponibles</dt>
            <dd>{creditSummary?.availableBalance ?? "Pendiente"}</dd>
          </div>
          <div>
            <dt>Créditos reservados</dt>
            <dd>{creditSummary?.reservedBalance ?? "Pendiente"}</dd>
          </div>
        </dl>

        <section aria-labelledby="credit-history-title">
          <h2 id="credit-history-title" className="section-title">
            Movimientos recientes
          </h2>
          {recentCreditTransactions.length > 0 ? (
            <ol className="ledger-list">
              {recentCreditTransactions.map((transaction) => (
                <li key={transaction.id}>
                  <div>
                    <strong>
                      {formatCreditTransactionType(transaction.transactionType)}
                    </strong>
                    <span>{transaction.reason}</span>
                  </div>
                  <dl>
                    <div>
                      <dt>Importe</dt>
                      <dd>{transaction.amount}</dd>
                    </div>
                    <div>
                      <dt>Disponible</dt>
                      <dd>{transaction.availableAfter}</dd>
                    </div>
                    <div>
                      <dt>Reservado</dt>
                      <dd>{transaction.reservedAfter}</dd>
                    </div>
                    <div>
                      <dt>Fecha</dt>
                      <dd>
                        {formatCreditTransactionDate(transaction.createdAt)}
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ol>
          ) : (
            <p className="supporting-text">Aún no hay movimientos.</p>
          )}
        </section>

        <section aria-labelledby="memory-candidates-title">
          <h2 id="memory-candidates-title" className="section-title">
            Recuerdos propuestos
          </h2>
          {recentProposedMemories.length > 0 ? (
            <ol className="ledger-list">
              {recentProposedMemories.map((memory) => (
                <li key={memory.id}>
                  <div>
                    <strong>{memory.title}</strong>
                    <span>
                      {formatMemoryType(memory.memoryType)} ·{" "}
                      {formatMemorySensitivity(memory.sensitivity)}
                    </span>
                  </div>
                  <dl>
                    <div>
                      <dt>Estado</dt>
                      <dd>Pendiente de confirmar</dd>
                    </div>
                    <div>
                      <dt>Fecha</dt>
                      <dd>{formatCreditTransactionDate(memory.createdAt)}</dd>
                    </div>
                  </dl>
                  <div className="inline-actions">
                    <form action={confirmMemory}>
                      <input name="memoryId" type="hidden" value={memory.id} />
                      <button className="primary-button" type="submit">
                        Confirmar
                      </button>
                    </form>
                    <form action={rejectMemory}>
                      <input name="memoryId" type="hidden" value={memory.id} />
                      <button className="secondary-button" type="submit">
                        Descartar
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="supporting-text">Aún no hay recuerdos propuestos.</p>
          )}
        </section>

        <section aria-labelledby="confirmed-memories-title">
          <h2 id="confirmed-memories-title" className="section-title">
            Recuerdos confirmados
          </h2>
          {recentConfirmedMemories.length > 0 ? (
            <ol className="ledger-list">
              {recentConfirmedMemories.map((memory) => (
                <li key={memory.id}>
                  <div>
                    <strong>{memory.title}</strong>
                    <span>
                      {formatMemoryType(memory.memoryType)} ·{" "}
                      {formatMemorySensitivity(memory.sensitivity)}
                    </span>
                  </div>
                  <dl>
                    <div>
                      <dt>Estado</dt>
                      <dd>Confirmado</dd>
                    </div>
                    <div>
                      <dt>Fecha</dt>
                      <dd>{formatCreditTransactionDate(memory.updatedAt)}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ol>
          ) : (
            <p className="supporting-text">Aún no hay recuerdos confirmados.</p>
          )}
        </section>

        <section aria-labelledby="commitments-title">
          <h2 id="commitments-title" className="section-title">
            Compromisos activos
          </h2>
          {recentActiveCommitments.length > 0 ? (
            <ol className="ledger-list">
              {recentActiveCommitments.map((commitment) => (
                <li key={commitment.id}>
                  <div>
                    <strong>{commitment.title}</strong>
                    <span>{formatCommitmentSource(commitment.source)}</span>
                  </div>
                  <dl>
                    <div>
                      <dt>Estado</dt>
                      <dd>Activo</dd>
                    </div>
                    <div>
                      <dt>Fecha objetivo</dt>
                      <dd>
                        {commitment.dueAt
                          ? formatCommitmentTargetDate(commitment.dueAt)
                          : "Sin fecha"}
                      </dd>
                    </div>
                    <div>
                      <dt>Fecha</dt>
                      <dd>
                        {formatCreditTransactionDate(commitment.createdAt)}
                      </dd>
                    </div>
                  </dl>
                  <div className="inline-actions">
                    <form action={completeCommitment}>
                      <input
                        name="commitmentId"
                        type="hidden"
                        value={commitment.id}
                      />
                      <button className="primary-button" type="submit">
                        Completar
                      </button>
                    </form>
                    <form action={archiveCommitment}>
                      <input
                        name="commitmentId"
                        type="hidden"
                        value={commitment.id}
                      />
                      <button className="secondary-button" type="submit">
                        Archivar
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="supporting-text">Aún no hay compromisos activos.</p>
          )}
        </section>

        <section aria-labelledby="session-summary-title">
          <h2 id="session-summary-title" className="section-title">
            Resúmenes de sesión
          </h2>
          {recentSessionSummaries.length > 0 ? (
            <ol className="ledger-list">
              {recentSessionSummaries.map((sessionSummary) => (
                <li key={sessionSummary.id}>
                  <div>
                    <strong>{sessionSummary.summary}</strong>
                    {sessionSummary.mainTopic ? (
                      <span>{sessionSummary.mainTopic}</span>
                    ) : null}
                  </div>
                  <dl>
                    <div>
                      <dt>Tipo</dt>
                      <dd>{formatSessionType(sessionSummary.sessionType)}</dd>
                    </div>
                    <div>
                      <dt>Fecha</dt>
                      <dd>
                        {formatCreditTransactionDate(sessionSummary.createdAt)}
                      </dd>
                    </div>
                    <div>
                      <dt>Seguridad</dt>
                      <dd>{sessionSummary.safetySummary ?? "Sin eventos"}</dd>
                    </div>
                  </dl>
                  <StructuredSummaryList
                    items={sessionSummary.decisions}
                    title="Decisiones"
                  />
                  <SaveableNextStepList
                    items={sessionSummary.nextSteps}
                    sessionSummaryId={sessionSummary.id}
                    title="Próximos pasos"
                  />
                  {sessionSummary.feedback ? (
                    <div className="supporting-text">
                      <p>
                        Feedback: {sessionSummary.feedback.satisfactionScore}/5
                        ·{" "}
                        {sessionSummary.feedback.wouldReuse
                          ? "Lo usaría de nuevo"
                          : "No lo usaría de nuevo"}
                      </p>
                      {sessionSummary.feedback.comment ? (
                        <p>Comentario: {sessionSummary.feedback.comment}</p>
                      ) : null}
                    </div>
                  ) : (
                    <form
                      action={submitSessionFeedback}
                      className="feedback-form"
                    >
                      <input
                        name="sessionId"
                        type="hidden"
                        value={sessionSummary.sessionId}
                      />
                      <label className="auth-field">
                        Utilidad
                        <select name="satisfactionScore" required>
                          <option value="">Elige una puntuación</option>
                          <option value="5">5 · Muy útil</option>
                          <option value="4">4 · Útil</option>
                          <option value="3">3 · Algo útil</option>
                          <option value="2">2 · Poco útil</option>
                          <option value="1">1 · Nada útil</option>
                        </select>
                      </label>
                      <fieldset className="choice-list compact-choice-list">
                        <legend>¿Lo usarías de nuevo?</legend>
                        <label className="check-row">
                          <input
                            name="wouldReuse"
                            required
                            type="radio"
                            value="yes"
                          />
                          Sí
                        </label>
                        <label className="check-row">
                          <input
                            name="wouldReuse"
                            required
                            type="radio"
                            value="no"
                          />
                          No
                        </label>
                      </fieldset>
                      <label className="auth-field">
                        Comentario breve opcional
                        <textarea
                          maxLength={280}
                          name="comment"
                          placeholder="Qué mejorarías del producto, sin detalles íntimos"
                          rows={3}
                        />
                      </label>
                      <button className="secondary-button" type="submit">
                        Guardar feedback
                      </button>
                    </form>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <p className="supporting-text">
              Aún no hay sesiones cerradas con resumen.
            </p>
          )}
        </section>

        <section aria-labelledby="usage-history-title">
          <h2 id="usage-history-title" className="section-title">
            Uso técnico reciente
          </h2>
          {recentUsageEvents.length > 0 ? (
            <ol className="ledger-list">
              {recentUsageEvents.map((usageEvent) => (
                <li key={usageEvent.id}>
                  <div>
                    <strong>
                      {formatUsageOperation(usageEvent.operationType)}
                    </strong>
                    <span>
                      {usageEvent.provider} · {usageEvent.model}
                    </span>
                  </div>
                  <dl>
                    <div>
                      <dt>Entrada</dt>
                      <dd>{usageEvent.inputUnits ?? "N/D"}</dd>
                    </div>
                    <div>
                      <dt>Salida</dt>
                      <dd>{usageEvent.outputUnits ?? "N/D"}</dd>
                    </div>
                    <div>
                      <dt>Duración</dt>
                      <dd>{usageEvent.durationMs} ms</dd>
                    </div>
                    <div>
                      <dt>Estado</dt>
                      <dd>{formatUsageStatus(usageEvent.status)}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ol>
          ) : (
            <p className="supporting-text">
              Aún no hay uso técnico registrado.
            </p>
          )}
        </section>

        <div className="auth-actions">
          {userContext.profile?.onboardingCompleted ? (
            <Link className="primary-link" href="/modos/ordenar-cabeza">
              Ordenar mi cabeza
            </Link>
          ) : (
            <Link className="primary-link" href="/onboarding">
              Continuar onboarding
            </Link>
          )}
          {userContext.profile?.onboardingCompleted ? (
            <Link className="secondary-link" href="/conversacion">
              Abrir conversación
            </Link>
          ) : null}
          {userContext.profile?.onboardingCompleted ? (
            <Link className="secondary-link" href="/preferencias">
              Preferencias
            </Link>
          ) : null}
          {userContext.profile?.onboardingCompleted ? (
            <form action={startPrivateConversation}>
              <button className="secondary-button" type="submit">
                Conversación privada
              </button>
            </form>
          ) : null}
          {userContext.profile?.onboardingCompleted ? (
            <Link className="secondary-link" href="/memoria">
              Memoria
            </Link>
          ) : null}
          {userContext.profile?.onboardingCompleted ? (
            <Link className="secondary-link" href="/compromisos">
              Compromisos
            </Link>
          ) : null}
          {userContext.profile?.onboardingCompleted ? (
            <Link className="secondary-link" href="/historial">
              Historial
            </Link>
          ) : null}
          {userContext.profile?.onboardingCompleted ? (
            <Link className="secondary-link" href="/metricas">
              Métricas
            </Link>
          ) : null}
          {userContext.profile?.onboardingCompleted ? (
            <Link className="secondary-link" href="/modos/tomar-decision">
              Tomar una decisión
            </Link>
          ) : null}
          {userContext.profile?.onboardingCompleted ? (
            <Link className="secondary-link" href="/modos/habito">
              Crear o revisar un hábito
            </Link>
          ) : null}
          {userContext.profile?.onboardingCompleted ? (
            <Link className="secondary-link" href="/modos/diario-guiado">
              Diario guiado
            </Link>
          ) : null}
          {userContext.profile?.onboardingCompleted ? (
            <Link className="secondary-link" href="/modos/conversacion-dificil">
              Preparar conversación difícil
            </Link>
          ) : null}
          {userContext.profile?.onboardingCompleted ? (
            <Link className="secondary-link" href="/modos/desarrollo-personal">
              Desarrollo personal
            </Link>
          ) : null}
          <Link className="secondary-link" href="/privacidad">
            Privacidad
          </Link>
          <SignOutButton />
        </div>
      </section>
    </main>
  );
}

function StructuredSummaryList(input: { title: string; items: string[] }) {
  const items = input.items
    .filter((item) => item.trim().length > 0)
    .slice(0, 3);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="supporting-text">
      <strong>{input.title}</strong>
      <ul>
        {items.map((item, index) => (
          <li key={`${input.title}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function SaveableNextStepList(input: {
  title: string;
  items: string[];
  sessionSummaryId: string;
}) {
  const items = input.items
    .filter((item) => item.trim().length > 0)
    .slice(0, 3);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="supporting-text">
      <strong>{input.title}</strong>
      <ul>
        {items.map((item, index) => (
          <li key={`${input.title}-${index}`}>
            <span>{item}</span>
            <form action={createCommitmentFromNextStep}>
              <input
                name="sessionSummaryId"
                type="hidden"
                value={input.sessionSummaryId}
              />
              <input name="nextStep" type="hidden" value={item} />
              <button className="secondary-button" type="submit">
                Guardar compromiso
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatCreditTransactionType(transactionType: string) {
  const labels: Record<string, string> = {
    initial_balance: "Saldo inicial",
    reservation: "Reserva",
    consumption: "Consumo",
    release: "Liberación",
    refund: "Devolución",
  };

  return labels[transactionType] ?? transactionType;
}

function formatCreditTransactionDate(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function formatCommitmentTargetDate(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
  }).format(date);
}

function formatUsageOperation(operationType: string) {
  const labels: Record<string, string> = {
    "conversation.reply": "Respuesta de conversación",
    "guided.create_or_review_habit.reply": "Modo hábito",
    "guided.journaling.reply": "Diario guiado",
    "guided.make_decision.reply": "Modo decisión",
    "guided.organize_thoughts.reply": "Modo ordenar cabeza",
    "guided.prepare_difficult_conversation.reply":
      "Preparar conversación difícil",
    "guided.personal_development.reply": "Desarrollo personal",
  };

  return labels[operationType] ?? operationType;
}

function formatUsageStatus(status: string) {
  const labels: Record<string, string> = {
    completed: "Completado",
    failed: "Fallido",
    replaced: "Sustituido por seguridad",
    truncated: "Truncado",
  };

  return labels[status] ?? status;
}

function formatSessionType(sessionType: string) {
  const labels: Record<string, string> = {
    free_chat: "Conversación libre",
    guided_mode: "Modo guiado",
  };

  return labels[sessionType] ?? sessionType;
}

function formatMemoryType(memoryType: string) {
  const labels: Record<string, string> = {
    profile: "Perfil",
    preference: "Preferencia",
    goal: "Objetivo",
    general: "General",
  };

  return labels[memoryType] ?? memoryType;
}

function formatMemorySensitivity(sensitivity: string) {
  const labels: Record<string, string> = {
    general: "General",
    personal: "Personal",
    sensitive: "Sensible",
    highly_sensitive: "Muy sensible",
  };

  return labels[sensitivity] ?? sensitivity;
}

function formatCommitmentSource(source: string) {
  const labels: Record<string, string> = {
    session_next_step: "Próximo paso de sesión",
  };

  return labels[source] ?? source;
}

function formatAgentTone(tone: string) {
  const labels: Record<string, string> = {
    soft: "Suave",
    balanced: "Equilibrado",
    direct: "Directo",
    calm: "Calmado",
    warm: "Cercano",
  };

  return labels[tone] ?? tone;
}

function formatAgentStyle(style: string) {
  const labels: Record<string, string> = {
    practical: "Práctico",
    reflective: "Reflexivo",
    inspiring: "Inspirador",
    supportive: "De apoyo",
  };

  return labels[style] ?? style;
}

function formatResponseLength(responseLength: string) {
  const labels: Record<string, string> = {
    short: "Breve",
    medium: "Media",
    long: "Detallada",
  };

  return labels[responseLength] ?? responseLength;
}

function formatInitiativeLevel(initiativeLevel: number) {
  const labels: Record<number, string> = {
    0: "Baja",
    1: "Equilibrada",
    2: "Alta",
  };

  return labels[initiativeLevel] ?? String(initiativeLevel);
}

function getFeedbackStatusMessage(feedbackStatus: string | undefined) {
  const labels: Record<string, string> = {
    invalid: "No se ha guardado el feedback porque faltaba algún dato válido.",
    not_saved:
      "No se ha guardado el feedback porque la sesión ya no está disponible.",
    saved: "Feedback guardado.",
  };

  return feedbackStatus ? (labels[feedbackStatus] ?? null) : null;
}
