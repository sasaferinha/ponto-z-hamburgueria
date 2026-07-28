// A senha original não fica salva no projeto, apenas sua impressão digital.
const PASSWORD_HASH = "c933e171d9ec477081ef9f5906c7c45788d59df9c62ce3aac7b92500ea17c164";
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
