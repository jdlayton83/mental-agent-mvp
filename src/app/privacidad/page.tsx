import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/modules/auth/session";
import { grantConsent, revokeConsent } from "@/modules/consent/actions";
import {
  getConsentActionLabel,
  getCurrentConsentStates,
} from "@/modules/consent/state";
import { deleteCurrentAccount } from "@/modules/privacy/delete-account-actions";
import { deleteAccountConfirmationPhrase } from "@/modules/privacy/delete-account-constants";

export default async function PrivacidadPage({
  searchParams,
}: {
  searchParams?: Promise<{
    deleteError?: string;
  }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const consentStates = await getCurrentConsentStates(user.id);
  const resolvedSearchParams = await searchParams;
  const hasDeleteConfirmationError =
    resolvedSearchParams?.deleteError === "confirmation";

  return (
    <main className="page-shell">
      <section
        className="auth-panel wide-panel"
        aria-labelledby="privacy-title"
      >
        <p className="eyebrow">Privacidad</p>
        <h1 id="privacy-title">Consentimientos</h1>
        <p className="supporting-text">
          Controla las autorizaciones básicas del MVP. Estos controles no
          sustituyen una política legal completa; sirven para validar el flujo
          de consentimiento y revocación.
        </p>

        <ol className="ledger-list">
          {consentStates.map((consent) => {
            const isGranted = consent.status === "granted";
            const action = isGranted ? revokeConsent : grantConsent;

            return (
              <li key={consent.type}>
                <div>
                  <strong>{consent.label}</strong>
                  <span>{consent.description}</span>
                </div>
                <dl>
                  <div>
                    <dt>Estado</dt>
                    <dd>{formatConsentStatus(consent.status)}</dd>
                  </div>
                  <div>
                    <dt>Tipo</dt>
                    <dd>{consent.required ? "Requerido" : "Opcional"}</dd>
                  </div>
                  <div>
                    <dt>Versión</dt>
                    <dd>{consent.policyVersion ?? "Pendiente"}</dd>
                  </div>
                  <div>
                    <dt>Fecha</dt>
                    <dd>
                      {formatConsentDate(
                        consent.grantedAt ?? consent.revokedAt,
                      )}
                    </dd>
                  </div>
                </dl>
                <form action={action}>
                  <input
                    name="consentType"
                    type="hidden"
                    value={consent.type}
                  />
                  <button
                    className={
                      isGranted ? "secondary-button" : "primary-button"
                    }
                    type="submit"
                  >
                    {getConsentActionLabel({
                      consentType: consent.type,
                      status: consent.status,
                    })}
                  </button>
                </form>
              </li>
            );
          })}
        </ol>

        <div className="auth-actions">
          <Link className="primary-link" href="/privacidad/exportar">
            Exportar mis datos
          </Link>
          <Link className="secondary-link" href="/inicio">
            Volver al inicio
          </Link>
        </div>

        <section aria-labelledby="delete-account-title">
          <h2 id="delete-account-title" className="section-title">
            Zona de borrado
          </h2>
          <p className="supporting-text">
            Esta acción borra los datos locales del MVP y desactiva la cuenta.
            No gestiona copias de seguridad ni solicitudes a proveedores
            externos.
          </p>
          <form action={deleteCurrentAccount} className="feedback-form">
            <label className="auth-field">
              Escribe {deleteAccountConfirmationPhrase} para confirmar
              <input
                autoComplete="off"
                name="confirmation"
                required
                type="text"
              />
            </label>
            {hasDeleteConfirmationError ? (
              <p className="auth-error">
                La frase de confirmación no coincide. No se ha borrado nada.
              </p>
            ) : null}
            <button className="secondary-button" type="submit">
              Borrar mi cuenta local
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}

function formatConsentStatus(status: string) {
  const labels: Record<string, string> = {
    granted: "Activo",
    revoked: "Revocado",
    missing: "Pendiente",
  };

  return labels[status] ?? status;
}

function formatConsentDate(date: Date | null) {
  if (!date) {
    return "Pendiente";
  }

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
