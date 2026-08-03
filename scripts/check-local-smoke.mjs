const baseUrl = normalizeBaseUrl(
  process.env.NEXTAUTH_URL || process.env.APP_URL || "http://localhost:3000",
);
const email = process.env.DEVELOPMENT_USER_EMAIL;
const password = process.env.DEVELOPMENT_USER_PASSWORD;
const errors = [];
const cookieJar = new Map();

const anonymousProtectedRoutes = [
  "/inicio",
  "/conversacion",
  "/memoria",
  "/metricas",
  "/privacidad",
];
const authenticatedRoutes = [
  "/inicio",
  "/conversacion",
  "/historial",
  "/memoria",
  "/compromisos",
  "/preferencias",
  "/metricas",
  "/privacidad",
  "/modos/ordenar-cabeza",
  "/modos/tomar-decision",
  "/modos/habito",
  "/modos/diario-guiado",
  "/modos/conversacion-dificil",
  "/modos/desarrollo-personal",
  "/privacidad/exportar",
];
const forbiddenMetricsSnippets = [
  "Quiero organizar mejor mi semana",
  "organizar mejor mi semana",
  "password_hash",
  "scrypt:",
];

if (!email) {
  errors.push("DEVELOPMENT_USER_EMAIL is required.");
}

if (!password) {
  errors.push("DEVELOPMENT_USER_PASSWORD is required.");
}

if (errors.length > 0) {
  reportFailure(errors);
}

try {
  await checkPublicRoutes();
  await checkAnonymousProtection();
  await checkCredentialsAuthentication();
  await checkNativeLoginPostFallback();
  await checkAuthenticatedRoutes();

  if (errors.length > 0) {
    reportFailure(errors);
  }

  console.log("Local smoke test passed.");
} catch (error) {
  reportFailure([getSafeErrorMessage(error)]);
}

async function checkPublicRoutes() {
  for (const route of ["/login", "/"]) {
    const response = await request(route);
    const body = await readTextBody(response);

    expectStatus(response, 200, route);
    expectNoErrorShell(route, body);

    if (
      route === "/login" &&
      !/<form\b[^>]*\baction="\/api\/login"[^>]*\bmethod="post"/.test(body)
    ) {
      errors.push(
        '/login form should submit with method="post" to /api/login.',
      );
    }
  }
}

async function checkAnonymousProtection() {
  for (const route of anonymousProtectedRoutes) {
    const response = await request(route);
    const location = response.headers.get("location");

    if (response.status !== 307 || location !== "/login") {
      errors.push(
        `${route} should redirect anonymous visitors to /login; got ${response.status} ${location ?? ""}`.trim(),
      );
    }
  }
}

async function checkCredentialsAuthentication() {
  const csrf = await getCsrfToken();

  const badLogin = await request("/api/auth/callback/credentials", {
    body: buildLoginBody(csrf, `${password}-wrong`),
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (badLogin.status !== 401) {
    errors.push(`Bad password should return 401; got ${badLogin.status}.`);
  }

  const freshCsrf = await getCsrfToken();
  const goodLogin = await request("/api/auth/callback/credentials", {
    body: buildLoginBody(freshCsrf, password),
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  expectStatus(goodLogin, 200, "/api/auth/callback/credentials");

  const loginBody = await readJsonBody(goodLogin);

  if (loginBody?.url !== `${baseUrl}/inicio`) {
    errors.push("Successful login should return the /inicio callback URL.");
  }
}

async function checkNativeLoginPostFallback() {
  cookieJar.clear();

  const badLogin = await request("/api/login", {
    body: new URLSearchParams({
      email,
      password: `${password}-wrong`,
    }),
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (
    badLogin.status !== 303 ||
    getLocationPath(badLogin) !== "/login?error=credentials"
  ) {
    errors.push(
      `/api/login native bad-password fallback should redirect to /login?error=credentials; got ${badLogin.status} ${badLogin.headers.get("location") ?? ""}`.trim(),
    );
  }

  const goodLogin = await request("/api/login", {
    body: new URLSearchParams({
      email,
      password,
    }),
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (goodLogin.status !== 303 || getLocationPath(goodLogin) !== "/inicio") {
    errors.push(
      `/api/login native fallback should redirect to /inicio; got ${goodLogin.status} ${goodLogin.headers.get("location") ?? ""}`.trim(),
    );
  }

  const inicio = await request("/inicio");
  const body = await readTextBody(inicio);

  expectStatus(inicio, 200, "/inicio after native /login POST");
  expectNoErrorShell("/inicio after native /login POST", body);
}

async function checkAuthenticatedRoutes() {
  for (const route of authenticatedRoutes) {
    const response = await request(route);
    const body = await readTextBody(response);

    expectStatus(response, 200, route);
    expectNoErrorShell(route, body);

    if (route === "/metricas") {
      if (!body.includes("Métricas básicas")) {
        errors.push("/metricas should render the metrics title.");
      }

      for (const snippet of forbiddenMetricsSnippets) {
        if (body.includes(snippet)) {
          errors.push(
            `/metricas should not expose sensitive snippet: ${snippet}`,
          );
        }
      }
    }

    if (route === "/privacidad/exportar") {
      if (!isJsonResponse(response)) {
        errors.push("/privacidad/exportar should return JSON.");
      }

      for (const snippet of ["password_hash", "passwordHash", "scrypt:"]) {
        if (body.includes(snippet)) {
          errors.push(`/privacidad/exportar should not expose ${snippet}.`);
        }
      }
    }
  }
}

async function getCsrfToken() {
  const response = await request("/api/auth/csrf");
  expectStatus(response, 200, "/api/auth/csrf");

  const body = await readJsonBody(response);

  if (typeof body?.csrfToken !== "string" || body.csrfToken.length === 0) {
    errors.push("NextAuth CSRF token is missing.");
    return "";
  }

  return body.csrfToken;
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers ?? {});
  const cookies = getCookieHeader();

  if (cookies) {
    headers.set("cookie", cookies);
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
    redirect: "manual",
  });

  rememberCookies(response);

  return response;
}

function rememberCookies(response) {
  for (const rawCookie of getSetCookieHeaders(response)) {
    const [cookiePair] = rawCookie.split(";");
    const equalsIndex = cookiePair.indexOf("=");

    if (equalsIndex === -1) {
      continue;
    }

    cookieJar.set(
      cookiePair.slice(0, equalsIndex),
      cookiePair.slice(equalsIndex + 1),
    );
  }
}

function getSetCookieHeaders(response) {
  if (typeof response.headers.getSetCookie === "function") {
    return response.headers.getSetCookie();
  }

  const header = response.headers.get("set-cookie");

  if (!header) {
    return [];
  }

  return splitCombinedSetCookieHeader(header);
}

function splitCombinedSetCookieHeader(header) {
  return header.split(/,(?=\s*[^;,=\s]+=[^;,]*)/);
}

function getCookieHeader() {
  return [...cookieJar.entries()]
    .map(([key, value]) => `${key}=${value}`)
    .join("; ");
}

function getLocationPath(response) {
  const location = response.headers.get("location");

  if (!location) {
    return null;
  }

  return (
    new URL(location, baseUrl).pathname + new URL(location, baseUrl).search
  );
}

function buildLoginBody(csrfToken, inputPassword) {
  return new URLSearchParams({
    callbackUrl: `${baseUrl}/inicio`,
    csrfToken,
    email,
    json: "true",
    password: inputPassword,
    redirect: "false",
  });
}

async function readTextBody(response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (
    !contentType.includes("text/html") &&
    !contentType.includes("application/json")
  ) {
    return "";
  }

  return response.text();
}

function isJsonResponse(response) {
  return (response.headers.get("content-type") ?? "").includes(
    "application/json",
  );
}

async function readJsonBody(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function expectStatus(response, expectedStatus, route) {
  if (response.status !== expectedStatus) {
    errors.push(
      `${route} should return ${expectedStatus}; got ${response.status}.`,
    );
  }
}

function expectNoErrorShell(route, body) {
  if (
    body.includes("__next_error__") ||
    body.includes("Build Error") ||
    body.includes("Runtime Error") ||
    body.includes("Server Actions must")
  ) {
    errors.push(`${route} rendered a Next.js error shell.`);
  }
}

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, "");
}

function getSafeErrorMessage(error) {
  if (error?.cause?.code === "ECONNREFUSED" || error?.code === "ECONNREFUSED") {
    return `Could not reach ${baseUrl}. Start the local Next.js server before running smoke:local.`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown local smoke test error.";
}

function reportFailure(messages) {
  console.error(["Local smoke test failed.", ...messages].join("\n"));
  process.exit(1);
}
