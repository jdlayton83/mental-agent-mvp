import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/modules/auth/session";
import { requireRequiredConsents } from "@/modules/consent/required-consents";
import {
  archiveMemory,
  confirmMemory,
  deleteMemory,
  editMemory,
  rejectMemory,
} from "@/modules/memory/actions";
import { getMemoriesForManagement } from "@/modules/memory/summary";

const memoryStatusOrder = [
  "proposed",
  "confirmed",
  "archived",
  "rejected",
  "deleted",
] as const;

const memoryStatusLabels: Record<string, string> = {
  proposed: "Propuestos",
  confirmed: "Confirmados",
  archived: "Archivados",
  rejected: "Descartados",
  deleted: "Eliminados",
};

export default async function MemoriaPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await requireRequiredConsents(user.id);

  const memories = await getMemoriesForManagement(user.id);

  return (
    <main className="page-shell">
      <section className="auth-panel wide-panel" aria-labelledby="memory-title">
        <p className="eyebrow">Memoria</p>
        <h1 id="memory-title">Recuerdos guardados</h1>
        <p className="supporting-text">
          Revisa lo que el producto puede usar para dar continuidad. Puedes
          confirmar, descartar, archivar o eliminar recuerdos cuando quieras.
        </p>

        {memories.length > 0 ? (
          memoryStatusOrder.map((status) => {
            const statusMemories = memories.filter(
              (memory) => memory.status === status,
            );

            if (statusMemories.length === 0) {
              return null;
            }

            return (
              <section aria-labelledby={`memory-${status}`} key={status}>
                <h2 className="section-title" id={`memory-${status}`}>
                  {memoryStatusLabels[status]}
                </h2>
                <ol className="ledger-list">
                  {statusMemories.map((memory) => (
                    <li key={memory.id}>
                      <div>
                        <strong>{memory.title}</strong>
                        <span>{memory.content}</span>
                      </div>
                      <dl>
                        <div>
                          <dt>Tipo</dt>
                          <dd>{formatMemoryType(memory.memoryType)}</dd>
                        </div>
                        <div>
                          <dt>Sensibilidad</dt>
                          <dd>{formatMemorySensitivity(memory.sensitivity)}</dd>
                        </div>
                        <div>
                          <dt>Confianza</dt>
                          <dd>{formatMemoryConfidence(memory.confidence)}</dd>
                        </div>
                        <div>
                          <dt>Recuperación</dt>
                          <dd>
                            {memory.isAvailableForRetrieval
                              ? "Disponible"
                              : "Desactivada"}
                          </dd>
                        </div>
                        <div>
                          <dt>Creado</dt>
                          <dd>{formatDate(memory.createdAt)}</dd>
                        </div>
                        <div>
                          <dt>Actualizado</dt>
                          <dd>{formatDate(memory.updatedAt)}</dd>
                        </div>
                      </dl>
                      <MemoryActions
                        content={memory.content}
                        memoryId={memory.id}
                        status={memory.status}
                        title={memory.title}
                      />
                    </li>
                  ))}
                </ol>
              </section>
            );
          })
        ) : (
          <p className="supporting-text">Todavía no hay recuerdos guardados.</p>
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

function MemoryActions(input: {
  content: string;
  memoryId: string;
  status: string;
  title: string;
}) {
  if (input.status === "deleted") {
    return null;
  }

  return (
    <>
      <form action={editMemory} className="feedback-form">
        <input name="memoryId" type="hidden" value={input.memoryId} />
        <label className="auth-field">
          Título
          <input
            defaultValue={input.title}
            maxLength={160}
            name="title"
            required
            type="text"
          />
        </label>
        <label className="auth-field">
          Contenido
          <textarea
            defaultValue={input.content}
            maxLength={1000}
            name="content"
            required
            rows={3}
          />
        </label>
        <button className="secondary-button" type="submit">
          Guardar corrección
        </button>
      </form>
      <div className="inline-actions">
        {input.status === "proposed" ? (
          <>
            <form action={confirmMemory}>
              <input name="memoryId" type="hidden" value={input.memoryId} />
              <button className="primary-button" type="submit">
                Confirmar
              </button>
            </form>
            <form action={rejectMemory}>
              <input name="memoryId" type="hidden" value={input.memoryId} />
              <button className="secondary-button" type="submit">
                Descartar
              </button>
            </form>
          </>
        ) : null}
        {input.status === "confirmed" ? (
          <form action={archiveMemory}>
            <input name="memoryId" type="hidden" value={input.memoryId} />
            <button className="secondary-button" type="submit">
              Archivar
            </button>
          </form>
        ) : null}
        <form action={deleteMemory}>
          <input name="memoryId" type="hidden" value={input.memoryId} />
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

function formatMemoryConfidence(confidence: string) {
  const labels: Record<string, string> = {
    low: "Baja",
    medium: "Media",
    high: "Alta",
    user_confirmed: "Confirmada por ti",
  };

  return labels[confidence] ?? confidence;
}
