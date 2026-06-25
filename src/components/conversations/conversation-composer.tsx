"use client";

import { useActionState } from "react";

import { sendConversationMessage } from "@/modules/conversations/conversation-flow";

const initialState = {
  error: null as string | null,
};

type ConversationComposerProps = {
  privateMode?: boolean;
};

export function ConversationComposer({
  privateMode = false,
}: ConversationComposerProps) {
  const [state, formAction, isPending] = useActionState(
    sendConversationMessage,
    initialState,
  );

  return (
    <form className="composer" action={formAction}>
      <label className="auth-field">
        Mensaje
        <textarea
          disabled={isPending}
          maxLength={2000}
          name="message"
          placeholder={
            privateMode ? "Escribe en modo privado" : "Escribe tu mensaje"
          }
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
          {isPending ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </form>
  );
}
