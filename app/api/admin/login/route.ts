import { adminCookie, validPassword } from "../../admin-auth";

export async function POST(request: Request) {
  const { password = "" } = (await request.json()) as { password?: string };
  if (!(await validPassword(password))) {
    return Response.json({ error: "Senha incorreta" }, { status: 401 });
  }
  return Response.json({ ok: true }, { headers: { "Set-Cookie": adminCookie() } });
}
