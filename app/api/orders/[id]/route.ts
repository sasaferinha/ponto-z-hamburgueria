import { eq, sql } from "drizzle-orm";
import { proxyDataRequest, usesRemoteData } from "../../data-proxy";

const statuses = new Set(["novo", "preparo", "pronto", "finalizado", "cancelado"]);

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (usesRemoteData()) return proxyDataRequest(request, `/api/orders/${id}`);
  const { getDb } = await import("../../../../db");
  const { orders } = await import("../../../../db/schema");
  const { status, viewed } = (await request.json()) as { status?: string; viewed?: boolean };
  if (status !== undefined && !statuses.has(status)) return Response.json({ error: "Status inválido" }, { status: 400 });
  if (viewed !== undefined && typeof viewed !== "boolean") return Response.json({ error: "Visualização inválida" }, { status: 400 });
  if (status === undefined && viewed === undefined) return Response.json({ error: "Nenhuma alteração informada" }, { status: 400 });
  const changes = { ...(status !== undefined ? { status } : {}), ...(viewed !== undefined ? { viewed } : {}), updatedAt: sql`CURRENT_TIMESTAMP` };
  const [order] = await getDb().update(orders).set(changes)
    .where(eq(orders.id, Number(id))).returning();
  if (!order) return Response.json({ error: "Pedido não encontrado" }, { status: 404 });
  return Response.json({ order });
}
