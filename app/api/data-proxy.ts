const DATA_ORIGIN = "https://ponto-z-hamburgueria.sebasgoleiro0320.chatgpt.site";

export function usesRemoteData() {
  return Boolean(process.env.VERCEL);
}

export async function proxyDataRequest(request: Request, pathname: string) {
  const method = request.method;
  const body = method === "GET" || method === "HEAD" ? undefined : await request.text();
  const response = await fetch(`${DATA_ORIGIN}${pathname}`, {
    method,
    headers: body ? { "Content-Type": request.headers.get("content-type") ?? "application/json" } : undefined,
    body,
    cache: "no-store",
  });
  return new Response(response.body, {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}
