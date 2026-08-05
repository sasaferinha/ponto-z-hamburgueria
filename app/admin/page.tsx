"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Item = { name: string; quantity: number; price: number; addOns: { name: string; price: number }[] };
type Order = {
  id: number; customerName: string; customerPhone: string; orderMode: string; neighborhood: string; street: string;
  addressDetails: string; paymentMethod: string; cashChangeChoice: string; cashAmountCents: number | null;
  itemsJson: string; total: number; status: string; viewed: boolean; createdAt: string;
};

const statusLabels: Record<string, string> = {
  novo: "Novo", preparo: "Em preparo", pronto: "Pronto", finalizado: "Finalizado", cancelado: "Cancelado",
};
const money = (cents: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
const orderDate = (createdAt: string) => new Date(createdAt.endsWith("Z") ? createdAt : `${createdAt}Z`);
const orderDayKey = (createdAt: string) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(orderDate(createdAt));
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
};
const orderDayLabel = (createdAt: string) => {
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo", weekday: "long", day: "2-digit", month: "2-digit", year: "numeric",
  }).format(orderDate(createdAt));
  return formatted.charAt(0).toLocaleUpperCase("pt-BR") + formatted.slice(1).replace(",", " ·");
};

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("nao-visualizados");
  const [storeSettings, setStoreSettings] = useState({ isOpen: true, deliveryTime: "40 a 60 minutos", pickupTime: "20 a 30 minutos" });
  const [savingSettings, setSavingSettings] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => new Set());
  const loadingOrders = useRef(false);

  const toggleGroup = (groupTitle: string) => {
    setCollapsedGroups((current) => {
      const next = new Set(current);
      if (next.has(groupTitle)) next.delete(groupTitle);
      else next.add(groupTitle);
      return next;
    });
  };

  const loadOrders = useCallback(async () => {
    if (loadingOrders.current) return;
    loadingOrders.current = true;
    try {
      const response = await fetch("/api/orders", { cache: "no-store" });
      if (!response.ok) throw new Error("Falha ao carregar pedidos");
      const data = await response.json() as { orders: Order[] };
      setOrders(data.orders); setLastUpdated(new Date()); setError("");
    } catch {
      setError("A conexão oscilou. O painel tentará novamente automaticamente.");
    } finally {
      setLoading(false); loadingOrders.current = false;
    }
  }, []);

  useEffect(() => {
    void loadOrders();
    fetch("/api/settings", { cache: "no-store" }).then((response) => response.json()).then((data) => data?.settings && setStoreSettings(data.settings)).catch(() => undefined);
    const refreshNow = () => void loadOrders();
    const refreshVisible = () => { if (document.visibilityState === "visible") refreshNow(); };
    const timer = window.setInterval(refreshNow, 3000);
    window.addEventListener("focus", refreshNow);
    document.addEventListener("visibilitychange", refreshVisible);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshNow);
      document.removeEventListener("visibilitychange", refreshVisible);
    };
  }, [loadOrders]);

  const saveSettings = async () => {
    setSavingSettings(true);
    const response = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(storeSettings) });
    if (!response.ok) setError("Não foi possível salvar o funcionamento.");
    else setError("");
    setSavingSettings(false);
  };

  const updateStatus = async (id: number, status: string) => {
    const previous = orders.find((order) => order.id === id)?.status;
    setOrders((current) => current.map((order) => order.id === id ? { ...order, status } : order));
    try {
      const response = await fetch(`/api/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (!response.ok) throw new Error("Falha ao atualizar");
      setError("");
    } catch {
      if (previous) setOrders((current) => current.map((order) => order.id === id ? { ...order, status: previous } : order));
      setError("Não foi possível alterar a situação. Tente novamente.");
    }
  };

  const updateViewed = async (id: number, viewed: boolean) => {
    setOrders((current) => current.map((order) => order.id === id ? { ...order, viewed } : order));
    try {
      const response = await fetch(`/api/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ viewed }) });
      if (!response.ok) throw new Error("Falha ao atualizar");
      setError("");
    } catch {
      setOrders((current) => current.map((order) => order.id === id ? { ...order, viewed: !viewed } : order));
      setError("Não foi possível salvar a visualização. Tente novamente.");
    }
  };

  const printOrder = (order: Order) => {
    const items = JSON.parse(order.itemsJson) as Item[];
    const deliveryItem = items.find((item) => item.name === "Taxa de entrega");
    const productItems = items.filter((item) => item.name !== "Taxa de entrega");
    const popup = window.open("", "_blank", "width=420,height=720");
    if (!popup) return;
    if (order.status === "novo") void updateStatus(order.id, "preparo");
    const rows = productItems.map((item) => `<div class="item"><b>${item.quantity}x ${item.name}</b><span>${money(Math.round(item.price * item.quantity * 100))}</span></div>${item.addOns.map((a) => `<small>+ ${a.name} — ${money(Math.round(a.price * 100))}${item.quantity > 1 ? " cada" : ""}</small>`).join("")}`).join("");
    const fulfillmentDetails = order.orderMode === "entrega"
      ? `<br><b>Endereço:</b> ${order.street}, ${order.addressDetails || "s/n"} - ${order.neighborhood}<br><b>Taxa de entrega:</b> ${deliveryItem ? money(Math.round(deliveryItem.price * 100)) : "A confirmar"}<br><b>Tempo estimado:</b> ${storeSettings.deliveryTime}`
      : `<br><b>Tempo estimado para retirada:</b> ${storeSettings.pickupTime}`;
    const paymentDetails = `<br><b>Forma de pagamento:</b> ${order.paymentMethod || "N\u00e3o informado"}${order.paymentMethod === "Dinheiro" ? order.cashChangeChoice === "yes" && order.cashAmountCents ? `<br><b>Troco para:</b> ${money(order.cashAmountCents)}` : `<br><b>Troco:</b> N\u00e3o precisa` : ""}`;
    popup.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Pedido #${order.id}</title><style>body{font:14px Arial;max-width:320px;margin:20px auto;color:#111}.head{text-align:center;border-bottom:2px dashed #111;padding-bottom:12px}.item{display:flex;justify-content:space-between;margin-top:12px;gap:12px}small{display:block;margin:3px 0 0 14px}.info{border-top:2px dashed #111;margin-top:15px;padding-top:12px;line-height:1.7}.total{display:flex;justify-content:space-between;font-size:18px;border-top:2px solid #111;margin-top:15px;padding-top:10px}@media print{body{margin:0}}</style></head><body><div class="head"><b>PONTO Z HAMBURGUERIA</b><h2>Pedido #${order.id}</h2><span>${new Date(order.createdAt + "Z").toLocaleString("pt-BR")}</span></div>${rows}<div class="info"><b>Cliente:</b> ${order.customerName}${order.customerPhone ? `<br><b>WhatsApp:</b> ${order.customerPhone}` : ""}<br><b>Recebimento:</b> ${order.orderMode === "entrega" ? "Entrega" : "Retirada"}${fulfillmentDetails}${paymentDetails}</div><div class="total"><b>Total</b><b>${money(order.total)}</b></div><script>window.onload=()=>window.print()<\/script></body></html>`);
    popup.document.close();
    if (order.status === "novo" && order.customerPhone) {
      const digits = order.customerPhone.replace(/\D/g, "");
      const whatsappPhone = digits.startsWith("55") && /^\d{12,13}$/.test(digits) ? digits : `55${digits}`;
      const message = `Ol\u00e1, ${order.customerName}! Seu pedido #${order.id} na Ponto Z j\u00e1 est\u00e1 sendo preparado.`;
      window.open(`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    }
  };

  if (loading) return <main className="admin-loading">Carregando painel...</main>;

  const visible = orders.filter((order) => {
    if (filter === "todos") return true;
    if (filter === "ativos") return !["finalizado", "cancelado"].includes(order.status);
    if (filter === "visualizados") return order.viewed;
    if (filter === "nao-visualizados") return !order.viewed;
    return order.status === filter;
  });
  const unseenOrders = visible.filter((order) => !order.viewed);
  const seenOrders = visible.filter((order) => order.viewed);
  const ordersByDay = visible.reduce<Record<string, Order[]>>((groups, order) => {
    const key = orderDayKey(order.createdAt);
    (groups[key] ??= []).push(order);
    return groups;
  }, {});
  const displayGroups: { title: string; subtitle: string; orders: Order[]; kind: "unseen" | "seen" | "day" }[] = filter === "todos"
    ? Object.values(ordersByDay).map((dailyOrders) => ({
        title: orderDayLabel(dailyOrders[0].createdAt), subtitle: "Pedidos realizados neste dia", orders: dailyOrders, kind: "day",
      }))
    : [
        { title: "Não visualizados", subtitle: "Aguardando sua atenção", orders: unseenOrders, kind: "unseen" },
        { title: "Já visualizados", subtitle: "Pedidos conferidos", orders: seenOrders, kind: "seen" },
      ];
  const activeCount = orders.filter((order) => !["finalizado", "cancelado"].includes(order.status)).length;
  const workflowGroups: { title: string; subtitle: string; orders: Order[]; kind: "new" | "preparing" | "finished" }[] = [
    { title: "Novos", subtitle: "Pedidos aguardando impress\u00e3o", orders: orders.filter((order) => order.status === "novo"), kind: "new" },
    { title: "Em preparo", subtitle: "Pedidos que est\u00e3o sendo preparados", orders: orders.filter((order) => ["preparo", "pronto"].includes(order.status)), kind: "preparing" },
    { title: "Finalizados", subtitle: "Pedidos conclu\u00eddos", orders: orders.filter((order) => ["finalizado", "cancelado"].includes(order.status)), kind: "finished" },
  ];
  return (
    <main className="admin-shell">
      <header className="admin-header"><div><p className="eyebrow">Central de pedidos</p><h1>Ponto Z</h1><span>{activeCount} {activeCount === 1 ? "pedido ativo" : "pedidos ativos"}{lastUpdated ? ` · atualizado às ${lastUpdated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}` : ""}</span></div><div><button onClick={() => void loadOrders()}>Atualizar agora</button><a href="/">Ver cardápio</a></div></header>
      <section className="store-controls" aria-labelledby="store-controls-title">
        <div><p className="eyebrow dark">Funcionamento</p><h2 id="store-controls-title">Status e entrega</h2><span>As mudanças aparecem automaticamente no cardápio.</span></div>
        <div className="open-control" role="group" aria-label="Status da hamburgueria">
          <button className={storeSettings.isOpen ? "selected open" : ""} onClick={() => setStoreSettings((current) => ({ ...current, isOpen: true }))}>Aberto</button>
          <button className={!storeSettings.isOpen ? "selected closed" : ""} onClick={() => setStoreSettings((current) => ({ ...current, isOpen: false }))}>Fechado</button>
        </div>
        <label><span>Tempo estimado de entrega</span><input value={storeSettings.deliveryTime} onChange={(event) => setStoreSettings((current) => ({ ...current, deliveryTime: event.target.value }))} placeholder="Ex.: 40 a 60 minutos" maxLength={60} /></label>
        <label><span>Tempo estimado de retirada</span><input value={storeSettings.pickupTime} onChange={(event) => setStoreSettings((current) => ({ ...current, pickupTime: event.target.value }))} placeholder="Ex.: 20 a 30 minutos" maxLength={60} /></label>
        <button className="save-store-settings" onClick={() => void saveSettings()} disabled={savingSettings || !storeSettings.deliveryTime.trim() || !storeSettings.pickupTime.trim()}>{savingSettings ? "Salvando..." : "Salvar funcionamento"}</button>
      </section>
      <nav className="admin-filters" aria-label="Filtrar pedidos">
        {[
          ['nao-visualizados', `Não visualizados (${orders.filter((order) => !order.viewed).length})`],
          ['visualizados', `Já visualizados (${orders.filter((order) => order.viewed).length})`],
          ['todos', 'Todos'],
        ].map(([value,label]) => <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{label}</button>)}
      </nav>
      {error && <p className="admin-error">{error}</p>}
      {visible.length === 0 && <div className="admin-empty"><b>Nenhum pedido nesta etapa</b><span>Os novos pedidos aparecerão aqui automaticamente.</span></div>}
      {workflowGroups.filter((group) => group.orders.length > 0).map((group) => { const isCollapsed = collapsedGroups.has(group.title); return (
        <section className={`admin-orders-group ${group.kind}${isCollapsed ? " collapsed" : ""}`} key={group.title}>
          <button className="orders-group-heading" type="button" onClick={() => toggleGroup(group.title)} aria-expanded={!isCollapsed} aria-controls={`orders-${group.title.replace(/[^a-zA-Z0-9]/g, "-")}`}>
            <div><span>{group.subtitle}</span><h2>{group.title}</h2></div>
            <div className="orders-group-actions"><b>{group.orders.length}</b><span className="group-toggle-label">{isCollapsed ? "Abrir" : "Minimizar"}</span><i aria-hidden="true">{isCollapsed ? "+" : "−"}</i></div>
          </button>
          <div id={`orders-${group.title.replace(/[^a-zA-Z0-9]/g, "-")}`} hidden={isCollapsed}>
          {group.orders.length === 0 ? <p className="orders-group-empty">Nenhum pedido nesta lista.</p> : <div className="order-board">
        {group.orders.map((order) => { const items = JSON.parse(order.itemsJson) as Item[]; return (
          <article className={`order-card status-${order.status} ${order.viewed ? "viewed" : "not-viewed"}`} key={order.id} onClick={() => { if (!order.viewed) void updateViewed(order.id, true); }}>
            <div className="order-head"><div><span>Pedido #{order.id}</span><h2>{order.customerName}</h2></div><time>{new Date(order.createdAt + "Z").toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</time></div>
            <div className="order-items">{items.map((item, index) => <div key={`${item.name}-${index}`}><p><b>{item.quantity}x</b> {item.name}</p>{item.addOns.map((addOn) => <small key={addOn.name}>+ {addOn.name} — {money(Math.round(addOn.price * 100))}{item.quantity > 1 ? " cada" : ""}</small>)}</div>)}</div>
            <div className="order-address"><b>{order.orderMode === "entrega" ? "Entrega" : "Retirada no balcão"}</b>{order.orderMode === "entrega" && <span>{order.street}, {order.addressDetails || "s/n"}<br />{order.neighborhood}</span>}</div>
            <div className="order-total"><span>Total do pedido</span><b>{money(order.total)}</b></div>
            <label className="status-select"><span>Situação</span><select value={order.status} onChange={(event) => void updateStatus(order.id, event.target.value)}>{Object.entries(statusLabels).map(([value,label]) => <option value={value} key={value}>{label}</option>)}</select></label>
            {group.kind === "preparing" && <button className="finish-order" onClick={() => void updateStatus(order.id, "finalizado")}>Finalizar pedido</button>}
            <button className="print-order" onClick={() => printOrder(order)}>{group.kind === "new" && order.customerPhone ? "Imprimir e avisar cliente" : "Reimprimir comanda"}</button>
          </article>
        ); })}</div>}
          </div>
        </section>
      ); })}
    </main>
  );
}
