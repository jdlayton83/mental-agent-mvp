import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/modules/auth/session";
import { getPilotMetrics } from "@/modules/metrics/pilot";

export default async function MetricasPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const metrics = await getPilotMetrics();

  return (
    <main className="page-shell">
      <section
        className="auth-panel wide-panel"
        aria-labelledby="metrics-title"
      >
        <p className="eyebrow">Piloto</p>
        <h1 id="metrics-title">Métricas básicas</h1>
        <p className="supporting-text">
          Vista local para revisar señales de uso del MVP. No muestra contenido
          de conversaciones, recuerdos, prompts ni datos exportados.
        </p>

        <section aria-labelledby="metrics-users-title">
          <h2 className="section-title" id="metrics-users-title">
            Usuarios
          </h2>
          <dl className="compact-summary">
            <MetricItem label="Activos" value={metrics.users.active} />
            <MetricItem label="Onboarding" value={metrics.users.onboarded} />
            <MetricItem
              label="Con conversación"
              value={metrics.users.withConversation}
            />
            <MetricItem
              label="Tasa onboarding"
              value={formatPercent(metrics.users.onboardingRate)}
            />
            <MetricItem
              label="Primera conversación"
              value={formatPercent(metrics.users.firstConversationRate)}
            />
          </dl>
        </section>

        <section aria-labelledby="metrics-sessions-title">
          <h2 className="section-title" id="metrics-sessions-title">
            Sesiones
          </h2>
          <dl className="compact-summary">
            <MetricItem
              label="Completadas"
              value={metrics.sessions.completed}
            />
            {metrics.sessions.byType.map((entry) => (
              <MetricItem
                key={entry.sessionType}
                label={formatSessionType(entry.sessionType)}
                value={entry.count}
              />
            ))}
          </dl>
        </section>

        <section aria-labelledby="metrics-feedback-title">
          <h2 className="section-title" id="metrics-feedback-title">
            Feedback
          </h2>
          <dl className="compact-summary">
            <MetricItem
              label="Respuestas"
              value={metrics.feedback.submittedCount}
            />
            <MetricItem
              label="Satisfacción media"
              value={formatDecimal(metrics.feedback.averageSatisfaction)}
            />
            <MetricItem
              label="Reutilizaría"
              value={metrics.feedback.wouldReuseCount}
            />
            <MetricItem
              label="Tasa reutilización"
              value={formatPercent(metrics.feedback.wouldReuseRate)}
            />
          </dl>
        </section>

        <section aria-labelledby="metrics-memory-title">
          <h2 className="section-title" id="metrics-memory-title">
            Memoria
          </h2>
          <dl className="compact-summary">
            <MetricItem
              label="Confirmados"
              value={metrics.memories.confirmed}
            />
            <MetricItem
              label="Archivados/eliminados"
              value={metrics.memories.archivedOrDeleted}
            />
            {metrics.memories.byStatus.map((entry) => (
              <MetricItem
                key={entry.status}
                label={formatMemoryStatus(entry.status)}
                value={entry.count}
              />
            ))}
          </dl>
        </section>

        <section aria-labelledby="metrics-safety-title">
          <h2 className="section-title" id="metrics-safety-title">
            Seguridad y auditoría
          </h2>
          <dl className="compact-summary">
            <MetricItem
              label="Eventos seguridad"
              value={metrics.safety.totalEvents}
            />
            <MetricItem
              label="Eventos auditoría"
              value={metrics.audit.totalEvents}
            />
            {metrics.safety.byLevel.map((entry) => (
              <MetricItem
                key={entry.riskLevel}
                label={`Riesgo ${entry.riskLevel}`}
                value={entry.count}
              />
            ))}
          </dl>

          {metrics.audit.byAction.length > 0 ? (
            <ol className="ledger-list">
              {metrics.audit.byAction.map((entry) => (
                <li key={entry.action}>
                  <div>
                    <strong>{formatAuditAction(entry.action)}</strong>
                    <span>{entry.action}</span>
                  </div>
                  <dl>
                    <div>
                      <dt>Eventos</dt>
                      <dd>{entry.count}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ol>
          ) : (
            <p className="supporting-text">Aún no hay eventos de auditoría.</p>
          )}
        </section>

        <section aria-labelledby="metrics-usage-title">
          <h2 className="section-title" id="metrics-usage-title">
            Uso técnico reciente
          </h2>
          {metrics.usage.recentEvents.length > 0 ? (
            <ol className="ledger-list">
              {metrics.usage.recentEvents.map((event) => (
                <li
                  key={`${event.operationType}-${event.createdAt.toISOString()}`}
                >
                  <div>
                    <strong>{formatUsageOperation(event.operationType)}</strong>
                    <span>
                      {event.provider} · {event.model}
                    </span>
                  </div>
                  <dl>
                    <div>
                      <dt>Estado</dt>
                      <dd>{formatUsageStatus(event.status)}</dd>
                    </div>
                    <div>
                      <dt>Duración</dt>
                      <dd>{event.durationMs} ms</dd>
                    </div>
                    <div>
                      <dt>Fecha</dt>
                      <dd>{formatDate(event.createdAt)}</dd>
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
          <Link className="secondary-link" href="/inicio">
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}

function MetricItem(input: { label: string; value: number | string }) {
  return (
    <div>
      <dt>{input.label}</dt>
      <dd>{input.value}</dd>
    </div>
  );
}

function formatPercent(value: number | null) {
  if (value === null) {
    return "N/D";
  }

  return new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 0,
    style: "percent",
  }).format(value);
}

function formatDecimal(value: number | null) {
  if (value === null) {
    return "N/D";
  }

  return new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(value);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function formatSessionType(sessionType: string) {
  const labels: Record<string, string> = {
    free_chat: "Chat libre",
    guided_mode: "Modo guiado",
  };

  return labels[sessionType] ?? sessionType;
}

function formatMemoryStatus(status: string) {
  const labels: Record<string, string> = {
    proposed: "Propuestos",
    confirmed: "Confirmados",
    rejected: "Descartados",
    archived: "Archivados",
    deleted: "Eliminados",
  };

  return labels[status] ?? status;
}

function formatAuditAction(action: string) {
  const labels: Record<string, string> = {
    "consent.granted": "Consentimiento concedido",
    "consent.revoked": "Consentimiento revocado",
    "memory.confirm": "Recuerdo confirmado",
    "memory.reject": "Recuerdo descartado",
    "memory.archive": "Recuerdo archivado",
    "memory.delete": "Recuerdo eliminado",
    "privacy.export": "Exportación de datos",
    "privacy.account_delete": "Borrado de cuenta",
  };

  return labels[action] ?? action;
}

function formatUsageOperation(operationType: string) {
  const labels: Record<string, string> = {
    "conversation.reply": "Respuesta de conversación",
  };

  return labels[operationType] ?? operationType;
}

function formatUsageStatus(status: string) {
  const labels: Record<string, string> = {
    completed: "Completado",
    replaced: "Sustituido por seguridad",
  };

  return labels[status] ?? status;
}
