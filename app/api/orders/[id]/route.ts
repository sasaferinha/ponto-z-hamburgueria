import { eq, sql } from "drizzle-orm";
import { getDb } from "../../../../db";
import { orders } from "../../../../db/schema";
import { isAdmin } from "../../admin-auth";

const statuses = new Set(["novo", "preparo", "pronto", "finalizado", "cancelado"]);

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isAdmin(request)) return Response.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await context.params;
  const { status } = (await request.json()) as { status?: string };
  if (!statuses.has(status ?? "")) return Response.json({ error: "Status inválido" }, { status: 400 });
  const [order] = await getDb().update(orders).set({ status, updatedAt: sql`CURRENT_TIMESTAMP` })
    .where(eq(orders.id, Number(id))).returning();
  if (!order) return Response.json({ error: "Pedido não encontrado" }, { status: 404 });
  return Response.json({ order });
}
