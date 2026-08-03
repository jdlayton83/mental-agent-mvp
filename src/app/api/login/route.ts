import { encode } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/config/env";
import { authOptions } from "@/modules/auth/auth-options";
import { authenticateCredentials } from "@/modules/auth/credentials";

const sessionMaxAgeSeconds = 30 * 24 * 60 * 60;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const user = await authenticateCredentials({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!user) {
    return NextResponse.redirect(
      new URL("/login?error=credentials", request.url),
      {
        status: 303,
      },
    );
  }

  const jwtToken = await authOptions.callbacks?.jwt?.({
    account: {
      provider: "credentials",
      providerAccountId: user.id,
      type: "credentials",
    },
    isNewUser: false,
    token: {
      email: user.email,
      name: user.email,
      sub: user.id,
    },
    trigger: "signIn",
    user: {
      email: user.email,
      id: user.id,
      name: user.email,
      sessionVersion: user.sessionVersion,
    },
  });

  if (!jwtToken) {
    return NextResponse.redirect(
      new URL("/login?error=credentials", request.url),
      {
        status: 303,
      },
    );
  }

  const token = await encode({
    maxAge: sessionMaxAgeSeconds,
    secret: env.AUTH_SECRET,
    token: jwtToken,
  });
  const response = NextResponse.redirect(new URL("/inicio", request.url), {
    status: 303,
  });

  response.cookies.set(getSessionCookieName(), token, {
    expires: new Date(Date.now() + sessionMaxAgeSeconds * 1000),
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: shouldUseSecureCookie(),
  });

  return response;
}

function getSessionCookieName() {
  return shouldUseSecureCookie()
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";
}

function shouldUseSecureCookie() {
  return env.NEXTAUTH_URL.startsWith("https://");
}
