import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/modules/auth/session";
import { getSessionHistory } from "@/modules/sessions/history";
import { getUserContext } from "@/modules/users/user-context";

export default async function HistorialPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const userContext = await getUserContext(user.id);

  if (!userContext.profile?.onboardingCompleted) {
    redirect("/onboarding");
  }

  const history = await getSessionHistory(user.id);

  return (
    <main className="page-shell">
      <section
        className="auth-panel wide-panel"
        aria-labelledby="history-title"
      >
        <p className="eyebrow">Historial</p>
        <h1 id="history-title">Conversaciones y sesiones</h1>
        <p className="supporting-text">
          Revisa actividad reciente sin mostrar el contenido completo de los
          mensajes.
        </p>

        {history.length > 0 ? (
          <ol className="ledger-list" aria-label="Historial de sesiones">
            {history.map((item) => (
              <li key={item.sessionId}>
                <div>
                  <strong>{item.title ?? "Sesión sin título"}</strong>
                  <span>
                    {formatSessionType(item.sessionType)}
                    {item.guidedModeName ? ` · ${item.guidedModeName}` : ""}
                  </span>
                </div>
                <dl>
                  <div>
                    <dt>Estado</dt>
                    <dd>{formatStatus(item.status)}</dd>
                  </div>
                  <div>
                    <dt>Última actividad</dt>
                    <dd>{formatDate(item.lastActivityAt)}</dd>
                  </div>
                  <div>
                    <dt>Créditos</dt>
                    <dd>{item.totalCreditCost}</dd>
                  </div>
                  <div>
                    <dt>Privacidad</dt>
                    <dd>{item.privateMode ? "Privada" : "Normal"}</dd>
                  </div>
                </dl>
                <p className="supporting-text">
                  {item.summary ??
                    item.mainTopic ??
                    "Resumen no disponible todavía."}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="supporting-text">
            Todavía no hay conversaciones o sesiones registradas.
          </p>
        )}

        <div className="auth-actions">
          <Link className="primary-link" href="/conversacion">
            Abrir conversación
          </Link>
          <Link className="secondary-link" href="/inicio">
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}

function formatSessionType(sessionType: string) {
  const labels: Record<string, string> = {
    free_chat: "Conversación libre",
    guided_mode: "Modo guiado",
  };

  return labels[sessionType] ?? sessionType;
}

function formatStatus(status: string) {
  const labels: Record<string, string> = {
    active: "Activa",
    completed: "Completada",
    paused: "Pausada",
    failed: "Fallida",
  };

  return labels[status] ?? status;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
