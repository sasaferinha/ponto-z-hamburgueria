// A senha original não fica salva no projeto, apenas sua impressão digital.
const PASSWORD_HASH = "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3";
const SESSION_TOKEN = "ponto-z-admin-2026-6e932a1c53b94293";
const COOKIE_NAME = "ponto_z_admin";

export async function validPassword(password: string) {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const received = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return received === PASSWORD_HASH;
}

export function isAdmin(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.split(";").some((part) => part.trim() === `${COOKIE_NAME}=${SESSION_TOKEN}`);
}

export function adminCookie() {
  return `${COOKIE_NAME}=${SESSION_TOKEN}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000`;
}

export function clearAdminCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}
