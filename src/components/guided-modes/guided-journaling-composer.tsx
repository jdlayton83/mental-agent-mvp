"use client";

import { useActionState } from "react";

import { sendGuidedJournalingMessage } from "@/modules/guided-modes/guided-journaling-actions";

const initialState = {
  error: null as string | null,
};

export function GuidedJournalingComposer({ question }: { question: string }) {
  const [state, formAction, isPending] = useActionState(
    sendGuidedJournalingMessage,
    initialState,
  );

  return (
    <form className="composer" action={formAction}>
      <label className="auth-field">
        Respuesta
        <textarea
          disabled={isPending}
          maxLength={2000}
          name="message"
          placeholder={question}
          required
          rows={4}
        />
      </label>

      {state.error ? (
        <p className="auth-error" aria-live="polite">
          {state.error}
        </p>
      ) : null}

      <div className="auth-actions">
        <button className="primary-button" disabled={isPending} type="submit">
          {isPending ? "Guardando..." : "Continuar"}
        </button>
      </div>
    </form>
  );
}
