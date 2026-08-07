import { desc } from "drizzle-orm";
import { proxyDataRequest, usesRemoteData } from "../data-proxy";

type OrderItem = { name: string; quantity: number; price: number; addOns: { name: string; price: number }[]; observation?: string };

export async function POST(request: Request) {
  if (usesRemoteData()) return proxyDataRequest(request, "/api/orders");
  const data = (await request.json()) as {
    customerName?: string; customerPhone?: string; orderMode?: string; neighborhood?: string; street?: string;
    addressDetails?: string; paymentMethod?: string; cashChangeChoice?: string;
    cashAmount?: number; orderObservation?: string; items?: OrderItem[]; total?: number;
  };
  const customerPhone = (data.customerPhone ?? "").replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  if (!data.customerName?.trim() || !/^\d{10,11}$/.test(customerPhone) ||
      !["entrega", "retirada", "local"].includes(data.orderMode ?? "") || !data.items?.length) {
    return Response.json({ error: "Pedido incompleto" }, { status: 400 });
  }
  if (data.orderMode === "entrega" && (!data.neighborhood?.trim() || !data.street?.trim())) {
    return Response.json({ error: "Endereço incompleto" }, { status: 400 });
  }
  const paymentMethods = ["Dinheiro", "Pix", "Cart\u00e3o de cr\u00e9dito", "Cart\u00e3o de d\u00e9bito"];
  if (data.orderMode !== "local" && !paymentMethods.includes(data.paymentMethod ?? "")) {
    return Response.json({ error: "Forma de pagamento invÃ¡lida" }, { status: 400 });
  }
  if (data.orderMode !== "local" && data.paymentMethod === "Dinheiro" && !["yes", "no"].includes(data.cashChangeChoice ?? "")) {
    return Response.json({ error: "Informe se precisa de troco" }, { status: 400 });
  }
  const sanitizedItems = data.items.map((item) => ({ ...item, observation: (item.observation ?? "").trim().slice(0, 200) }));
  const calculatedTotal = sanitizedItems.reduce((sum, item) =>
    sum + (item.price + item.addOns.reduce((extra, addOn) => extra + addOn.price, 0)) * item.quantity, 0);
  if (Math.abs(calculatedTotal - Number(data.total)) > 0.01) {
    return Response.json({ error: "Total inválido" }, { status: 400 });
  }
  if (data.orderMode !== "local" && data.paymentMethod === "Dinheiro" && data.cashChangeChoice === "yes" &&
      (!Number.isFinite(Number(data.cashAmount)) || Number(data.cashAmount) < calculatedTotal)) {
    return Response.json({ error: "Valor para troco inv\u00e1lido" }, { status: 400 });
  }
  const { getDb } = await import("../../../db");
  const { orders } = await import("../../../db/schema");
  const [order] = await getDb().insert(orders).values({
    customerName: data.customerName.trim(), customerPhone, orderMode: data.orderMode!,
    neighborhood: data.neighborhood?.trim() ?? "", street: data.street?.trim() ?? "",
    addressDetails: data.addressDetails?.trim() ?? "", paymentMethod: data.orderMode === "local" ? "" : data.paymentMethod!,
    cashChangeChoice: data.orderMode !== "local" && data.paymentMethod === "Dinheiro" ? data.cashChangeChoice! : "",
    cashAmountCents: data.orderMode !== "local" && data.paymentMethod === "Dinheiro" && data.cashChangeChoice === "yes"
      ? Math.round(Number(data.cashAmount) * 100) : null,
    orderObservation: (data.orderObservation ?? "").trim().slice(0, 300),
    itemsJson: JSON.stringify(sanitizedItems),
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
