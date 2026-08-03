export function SignInForm({ error }: { error: string | undefined }) {
  return (
    <form action="/api/login" className="auth-form" method="post">
      <label className="auth-field">
        <span>Correo electrónico</span>
        <input
          autoComplete="email"
          defaultValue="dev@example.local"
          name="email"
          required
          type="email"
        />
      </label>

      <label className="auth-field">
        <span>Contraseña</span>
        <input
          autoComplete="current-password"
          name="password"
          required
          type="password"
        />
      </label>

      {error ? <p className="auth-error">{error}</p> : null}

      <button className="primary-button" type="submit">
        Entrar
      </button>
    </form>
  );
}
