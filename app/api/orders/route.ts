import { desc } from "drizzle-orm";
import { proxyDataRequest, usesRemoteData } from "../data-proxy";

type OrderItem = { name: string; quantity: number; price: number; addOns: { name: string; price: number }[] };

export async function POST(request: Request) {
  if (usesRemoteData()) return proxyDataRequest(request, "/api/orders");
  const data = (await request.json()) as {
    customerName?: string; orderMode?: string; neighborhood?: string; street?: string;
    addressDetails?: string; items?: OrderItem[]; total?: number;
  };
  if (!data.customerName?.trim() || !["entrega", "retirada"].includes(data.orderMode ?? "") || !data.items?.length) {
    return Response.json({ error: "Pedido incompleto" }, { status: 400 });
  }
  if (data.orderMode === "entrega" && (!data.neighborhood?.trim() || !data.street?.trim())) {
    return Response.json({ error: "Endereço incompleto" }, { status: 400 });
  }
  const calculatedTotal = data.items.reduce((sum, item) =>
    sum + (item.price + item.addOns.reduce((extra, addOn) => extra + addOn.price, 0)) * item.quantity, 0);
  if (Math.abs(calculatedTotal - Number(data.total)) > 0.01) {
    return Response.json({ error: "Total inválido" }, { status: 400 });
  }
  const { getDb } = await import("../../../db");
  const { orders } = await import("../../../db/schema");
  const [order] = await getDb().insert(orders).values({
    customerName: data.customerName.trim(), orderMode: data.orderMode!,
    neighborhood: data.neighborhood?.trim() ?? "", street: data.street?.trim() ?? "",
    addressDetails: data.addressDetails?.trim() ?? "", itemsJson: JSON.stringify(data.items),
    total: Math.round(calculatedTotal * 100),
  }).returning();
  return Response.json({ order }, { status: 201 });
}

export async function GET() {
  if (usesRemoteData()) return proxyDataRequest(new Request("http://local/api/orders"), "/api/orders");
  const { getDb } = await import("../../../db");
  const { orders } = await import("../../../db/schema");
  const rows = await getDb().select().from(orders).orderBy(desc(orders.createdAt), desc(orders.id));
  return Response.json({ orders: rows });
}
