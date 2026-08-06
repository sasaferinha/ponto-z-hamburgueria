import { eq, sql } from "drizzle-orm";
import { proxyDataRequest, usesRemoteData } from "../data-proxy";

const defaults = { id: 1, isOpen: true, deliveryTime: "40 a 60 minutos", pickupTime: "20 a 30 minutos", openingHours: "18h às 00h" };

export async function GET() {
  if (usesRemoteData()) return proxyDataRequest(new Request("http://local/api/settings"), "/api/settings");
  const { getDb } = await import("../../../db");
  const { storeSettings } = await import("../../../db/schema");
  const db = getDb();
  const [settings] = await db.select().from(storeSettings).where(eq(storeSettings.id, 1)).limit(1);
  return Response.json({ settings: settings ?? defaults });
}

export async function PUT(request: Request) {
  if (usesRemoteData()) return proxyDataRequest(request, "/api/settings");
  const { getDb } = await import("../../../db");
  const { storeSettings } = await import("../../../db/schema");
  const data = (await request.json()) as { isOpen?: boolean; deliveryTime?: string; pickupTime?: string; openingHours?: string };
  const deliveryTime = data.deliveryTime?.trim() ?? "";
  const pickupTime = data.pickupTime?.trim() ?? "";
  const openingHours = data.openingHours?.trim() ?? "";
  if (typeof data.isOpen !== "boolean" || !deliveryTime || !pickupTime || !openingHours || deliveryTime.length > 60 || pickupTime.length > 60 || openingHours.length > 80) {
    return Response.json({ error: "Configuração inválida" }, { status: 400 });
  }
  const db = getDb();
  const [settings] = await db.insert(storeSettings).values({ id: 1, isOpen: data.isOpen, deliveryTime, pickupTime, openingHours })
    .onConflictDoUpdate({ target: storeSettings.id, set: { isOpen: data.isOpen, deliveryTime, pickupTime, openingHours, updatedAt: sql`CURRENT_TIMESTAMP` } })
    .returning();
  return Response.json({ settings });
}
