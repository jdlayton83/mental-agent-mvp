"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

export function SignOutButton() {
  const [isSigningOut, setIsSigningOut] = useState(false);

  return (
    <button
      className="secondary-button"
      disabled={isSigningOut}
      onClick={() => {
        setIsSigningOut(true);
        void signOut({ callbackUrl: "/" });
      }}
      type="button"
    >
      {isSigningOut ? "Saliendo..." : "Cerrar sesión"}
    </button>
  );
}
