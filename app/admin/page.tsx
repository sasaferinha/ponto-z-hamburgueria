"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Item = { name: string; quantity: number; price: number; addOns: { name: string; price: number }[] };
type Order = {
  id: number; customerName: string; orderMode: string; neighborhood: string; street: string;
  addressDetails: string; itemsJson: string; total: number; status: string; viewed: boolean; createdAt: string;
};

const statusLabels: Record<string, string> = {
  novo: "Novo", preparo: "Em preparo", pronto: "Pronto", finalizado: "Finalizado", cancelado: "Cancelado",
};
const money = (cents: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("nao-visualizados");
  const [storeSettings, setStoreSettings] = useState({ isOpen: true, deliveryTime: "40 a 60 minutos", pickupTime: "20 a 30 minutos" });
  const [savingSettings, setSavingSettings] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const loadingOrders = useRef(false);

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
    const popup = window.open("", "_blank", "width=420,height=720");
    if (!popup) return;
    const rows = items.map((item) => `<div class="item"><b>${item.quantity}x ${item.name}</b><span>${money(Math.round((item.price + item.addOns.reduce((s, a) => s + a.price, 0)) * item.quantity * 100))}</span></div>${item.addOns.map((a) => `<small>+ ${a.name}</small>`).join("")}`).join("");
    popup.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Pedido #${order.id}</title><style>body{font:14px Arial;max-width:320px;margin:20px auto;color:#111}.head{text-align:center;border-bottom:2px dashed #111;padding-bottom:12px}.item{display:flex;justify-content:space-between;margin-top:12px;gap:12px}small{display:block;margin:3px 0 0 14px}.info{border-top:2px dashed #111;margin-top:15px;padding-top:12px;line-height:1.6}.total{display:flex;justify-content:space-between;font-size:18px;border-top:2px solid #111;margin-top:15px;padding-top:10px}@media print{body{margin:0}}</style></head><body><div class="head"><b>PONTO Z HAMBURGUERIA</b><h2>Pedido #${order.id}</h2><span>${new Date(order.createdAt + "Z").toLocaleString("pt-BR")}</span></div>${rows}<div class="info"><b>Cliente:</b> ${order.customerName}<br><b>Recebimento:</b> ${order.orderMode === "entrega" ? "Entrega" : "Retirada"}${order.orderMode === "entrega" ? `<br><b>Endereço:</b> ${order.street}, ${order.addressDetails || "s/n"} - ${order.neighborhood}` : ""}</div><div class="total"><b>Total</b><b>${money(order.total)}</b></div><script>window.onload=()=>window.print()<\/script></body></html>`);
    popup.document.close();
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
  const activeCount = orders.filter((order) => !["finalizado", "cancelado"].includes(order.status)).length;
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
      {[{ title: "Não visualizados", orders: unseenOrders, unseen: true }, { title: "Já visualizados", orders: seenOrders, unseen: false }].map((group) => (
        <section className={`admin-orders-group ${group.unseen ? "unseen" : "seen"}`} key={group.title}>
          <div className="orders-group-heading"><div><span>{group.unseen ? "Aguardando sua atenção" : "Pedidos conferidos"}</span><h2>{group.title}</h2></div><b>{group.orders.length}</b></div>
          {group.orders.length === 0 ? <p className="orders-group-empty">Nenhum pedido nesta lista.</p> : <div className="order-board">
        {group.orders.map((order) => { const items = JSON.parse(order.itemsJson) as Item[]; return (
          <article className={`order-card status-${order.status} ${order.viewed ? "viewed" : "not-viewed"}`} key={order.id} onClick={() => { if (!order.viewed) void updateViewed(order.id, true); }}>
            <div className="order-head"><div><span>Pedido #{order.id}</span><h2>{order.customerName}</h2></div><time>{new Date(order.createdAt + "Z").toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</time></div>
            <div className="order-items">{items.map((item, index) => <div key={`${item.name}-${index}`}><p><b>{item.quantity}x</b> {item.name}</p>{item.addOns.map((addOn) => <small key={addOn.name}>+ {addOn.name}</small>)}</div>)}</div>
            <div className="order-address"><b>{order.orderMode === "entrega" ? "Entrega" : "Retirada no balcão"}</b>{order.orderMode === "entrega" && <span>{order.street}, {order.addressDetails || "s/n"}<br />{order.neighborhood}</span>}</div>
            <div className="order-total"><span>Total do pedido</span><b>{money(order.total)}</b></div>
            <label className="status-select"><span>Situação</span><select value={order.status} onChange={(event) => void updateStatus(order.id, event.target.value)}>{Object.entries(statusLabels).map(([value,label]) => <option value={value} key={value}>{label}</option>)}</select></label>
            <button className="print-order" onClick={() => printOrder(order)}>Imprimir comanda</button>
          </article>
        ); })}</div>}
        </section>
      ))}
    </main>
  );
}
