import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/modules/auth/session";
import {
  archiveCommitment,
  completeCommitment,
  deleteCommitment,
  updateCommitmentDueDate,
} from "@/modules/commitments/actions";
import { getCommitmentsForManagement } from "@/modules/commitments/summary";

const commitmentStatusOrder = [
  "active",
  "completed",
  "archived",
  "deleted",
] as const;

const commitmentStatusLabels: Record<string, string> = {
  active: "Activos",
  completed: "Completados",
  archived: "Archivados",
  deleted: "Eliminados",
};

export default async function CompromisosPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const commitments = await getCommitmentsForManagement(user.id);

  return (
    <main className="page-shell">
      <section
        className="auth-panel wide-panel"
        aria-labelledby="commitments-title"
      >
        <p className="eyebrow">Compromisos</p>
        <h1 id="commitments-title">Próximos pasos guardados</h1>
        <p className="supporting-text">
          Revisa acciones que decidiste guardar desde una sesión. Puedes
          completarlas, archivarlas o eliminarlas sin afectar a tus recuerdos.
        </p>

        {commitments.length > 0 ? (
          commitmentStatusOrder.map((status) => {
            const statusCommitments = commitments.filter(
              (commitment) => commitment.status === status,
            );

            if (statusCommitments.length === 0) {
              return null;
            }

            return (
              <section aria-labelledby={`commitments-${status}`} key={status}>
                <h2 className="section-title" id={`commitments-${status}`}>
                  {commitmentStatusLabels[status]}
                </h2>
                <ol className="ledger-list">
                  {statusCommitments.map((commitment) => (
                    <li key={commitment.id}>
                      <div>
                        <strong>{commitment.title}</strong>
                        {commitment.description ? (
                          <span>{commitment.description}</span>
                        ) : (
                          <span>
                            {formatCommitmentSource(commitment.source)}
                          </span>
                        )}
                      </div>
                      <dl>
                        <div>
                          <dt>Estado</dt>
                          <dd>{formatCommitmentStatus(commitment.status)}</dd>
                        </div>
                        <div>
                          <dt>Confirmación</dt>
                          <dd>
                            {commitment.isConfirmedByUser
                              ? "Confirmado por ti"
                              : "Pendiente"}
                          </dd>
                        </div>
                        <div>
                          <dt>Fecha objetivo</dt>
                          <dd>
                            {commitment.dueAt
                              ? formatTargetDate(commitment.dueAt)
                              : "Sin fecha"}
                          </dd>
                        </div>
                        <div>
                          <dt>Creado</dt>
                          <dd>{formatDate(commitment.createdAt)}</dd>
                        </div>
                        <div>
                          <dt>Actualizado</dt>
                          <dd>{formatDate(commitment.updatedAt)}</dd>
                        </div>
                      </dl>
                      <CommitmentActions
                        dueAt={commitment.dueAt}
                        commitmentId={commitment.id}
                        status={commitment.status}
                      />
                    </li>
                  ))}
                </ol>
              </section>
            );
          })
        ) : (
          <p className="supporting-text">
            Todavía no hay compromisos guardados.
          </p>
        )}

        <div className="auth-actions">
          <Link className="secondary-link" href="/inicio">
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}

function CommitmentActions(input: {
  commitmentId: string;
  dueAt: Date | null;
  status: string;
}) {
  if (input.status === "deleted") {
    return null;
  }

  return (
    <>
      <form action={updateCommitmentDueDate} className="feedback-form">
        <input name="commitmentId" type="hidden" value={input.commitmentId} />
        <label className="auth-field">
          Fecha objetivo
          <input
            defaultValue={formatDateInputValue(input.dueAt)}
            name="dueDate"
            type="date"
          />
        </label>
        <button className="secondary-button" type="submit">
          Guardar fecha
        </button>
      </form>
      <div className="inline-actions">
        {input.status === "active" ? (
          <>
            <form action={completeCommitment}>
              <input
                name="commitmentId"
                type="hidden"
                value={input.commitmentId}
              />
              <button className="primary-button" type="submit">
                Completar
              </button>
            </form>
            <form action={archiveCommitment}>
              <input
                name="commitmentId"
                type="hidden"
                value={input.commitmentId}
              />
              <button className="secondary-button" type="submit">
                Archivar
              </button>
            </form>
          </>
        ) : null}
        <form action={deleteCommitment}>
          <input name="commitmentId" type="hidden" value={input.commitmentId} />
          <button className="secondary-button" type="submit">
            Eliminar
          </button>
        </form>
      </div>
    </>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function formatTargetDate(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
  }).format(date);
}

function formatDateInputValue(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

function formatCommitmentStatus(status: string) {
  const labels: Record<string, string> = {
    active: "Activo",
    completed: "Completado",
    archived: "Archivado",
    deleted: "Eliminado",
  };

  return labels[status] ?? status;
}

function formatCommitmentSource(source: string) {
  const labels: Record<string, string> = {
    session_next_step: "Próximo paso de sesión",
  };

  return labels[source] ?? source;
}
