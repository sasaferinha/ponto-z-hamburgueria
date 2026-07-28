"use client";

import { useCallback, useEffect, useState } from "react";

type Item = { name: string; quantity: number; price: number; addOns: { name: string; price: number }[] };
type Order = {
  id: number; customerName: string; orderMode: string; neighborhood: string; street: string;
  addressDetails: string; itemsJson: string; total: number; status: string; createdAt: string;
};

const statusLabels: Record<string, string> = {
  novo: "Novo", preparo: "Em preparo", pronto: "Pronto", finalizado: "Finalizado", cancelado: "Cancelado",
};
const money = (cents: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ativos");

  const loadOrders = useCallback(async () => {
    const response = await fetch("/api/orders", { cache: "no-store" });
    if (!response.ok) { setError("Não foi possível carregar os pedidos."); setLoading(false); return; }
    const data = await response.json() as { orders: Order[] };
    setOrders(data.orders); setLoading(false); setError("");
  }, []);

  useEffect(() => {
    void loadOrders();
    const timer = window.setInterval(() => void loadOrders(), 15000);
    return () => window.clearInterval(timer);
  }, [loadOrders]);

  const updateStatus = async (id: number, status: string) => {
    const response = await fetch(`/api/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (response.ok) setOrders((current) => current.map((order) => order.id === id ? { ...order, status } : order));
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

  const visible = orders.filter((order) => filter === "todos" || (filter === "ativos" ? !["finalizado", "cancelado"].includes(order.status) : order.status === filter));
  const activeCount = orders.filter((order) => !["finalizado", "cancelado"].includes(order.status)).length;
  return (
    <main className="admin-shell">
      <header className="admin-header"><div><p className="eyebrow">Central de pedidos</p><h1>Ponto Z</h1><span>{activeCount} {activeCount === 1 ? "pedido ativo" : "pedidos ativos"}</span></div><div><button onClick={() => void loadOrders()}>Atualizar</button><a href="/">Ver cardápio</a></div></header>
      <nav className="admin-filters" aria-label="Filtrar pedidos">
        {[['ativos','Ativos'],['novo','Novos'],['todos','Todos']].map(([value,label]) => <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{label}</button>)}
      </nav>
      {error && <p className="admin-error">{error}</p>}
      <section className="order-board">
        {visible.length === 0 && <div className="admin-empty"><b>Nenhum pedido nesta etapa</b><span>Os novos pedidos aparecerão aqui automaticamente.</span></div>}
        {visible.map((order) => { const items = JSON.parse(order.itemsJson) as Item[]; return (
          <article className={`order-card status-${order.status}`} key={order.id}>
            <div className="order-head"><div><span>Pedido #{order.id}</span><h2>{order.customerName}</h2></div><time>{new Date(order.createdAt + "Z").toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</time></div>
            <div className="order-items">{items.map((item, index) => <div key={`${item.name}-${index}`}><p><b>{item.quantity}x</b> {item.name}</p>{item.addOns.map((addOn) => <small key={addOn.name}>+ {addOn.name}</small>)}</div>)}</div>
            <div className="order-address"><b>{order.orderMode === "entrega" ? "Entrega" : "Retirada no balcão"}</b>{order.orderMode === "entrega" && <span>{order.street}, {order.addressDetails || "s/n"}<br />{order.neighborhood}</span>}</div>
            <div className="order-total"><span>Total dos itens</span><b>{money(order.total)}</b></div>
            <label className="status-select"><span>Situação</span><select value={order.status} onChange={(event) => void updateStatus(order.id, event.target.value)}>{Object.entries(statusLabels).map(([value,label]) => <option value={value} key={value}>{label}</option>)}</select></label>
            <button className="print-order" onClick={() => printOrder(order)}>Imprimir comanda</button>
          </article>
        ); })}
      </section>
    </main>
  );
}
