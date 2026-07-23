"use client";

import { useMemo, useState } from "react";

type Product = {
  name: string;
  price: number;
  description: string;
  category: string;
  badge?: string;
};

type CartItem = Product & { quantity: number };

const categories = [
  { id: "padrao", label: "Tradicionais", icon: "🍔" },
  { id: "frango", label: "Frango", icon: "🍗" },
  { id: "artesanal", label: "Artesanais", icon: "🔥" },
  { id: "lombo", label: "Lombo", icon: "🥩" },
  { id: "especiais", label: "Especiais", icon: "⭐" },
  { id: "adicionais", label: "Adicionais", icon: "➕" },
  { id: "bebidas", label: "Bebidas", icon: "🥤" },
];

const base = "Molho da casa, batata palha";
const products: Product[] = [
  { category: "padrao", name: "X-Burguer", price: 16, description: `${base}, muçarela e hambúrguer 120g`, badge: "Clássico" },
  { category: "padrao", name: "X-Egg", price: 17, description: `${base}, muçarela, ovo e hambúrguer 120g` },
  { category: "padrao", name: "X-Salada", price: 19, description: `${base}, alface, tomate, milho, muçarela e hambúrguer 120g` },
  { category: "padrao", name: "X-Salada Egg", price: 22, description: `${base}, alface, tomate, milho, muçarela, ovo e hambúrguer 120g` },
  { category: "padrao", name: "X-Bacon", price: 26, description: `${base}, alface, tomate, milho, bacon, muçarela e hambúrguer 120g`, badge: "Favorito" },
  { category: "padrao", name: "X-Bacon Egg", price: 28, description: `${base}, alface, tomate, milho, bacon, muçarela, ovo e hambúrguer 120g` },
  { category: "padrao", name: "X-Calabresa", price: 23, description: `${base}, alface, tomate, milho, muçarela e calabresa` },
  { category: "padrao", name: "X-Calabresa Egg", price: 25, description: `${base}, alface, tomate, milho, muçarela, ovo e calabresa` },
  { category: "padrao", name: "X-Tudinho", price: 30, description: `${base}, alface, tomate, milho, muçarela, ovo, ½ calabresa, ½ bacon, ½ frango e hambúrguer 120g` },
  { category: "padrao", name: "X-Tudo", price: 35, description: `${base}, alface, tomate, milho, presunto, muçarela, ovo, calabresa, bacon, frango e hambúrguer 120g`, badge: "Completo" },
  { category: "padrao", name: "X-Grandão", price: 38, description: `${base}, alface, tomate, milho, presunto, muçarela, 2 ovos, 2 bacons e hambúrguer 120g` },
  { category: "padrao", name: "X-Larika", price: 48, description: `${base}, alface, tomate, milho, 3 ovos, 2 bacons, frango, 2 presuntos, 2 muçarelas e 2 hambúrgueres 120g`, badge: "Gigante" },
  { category: "padrao", name: "X-Catupiry", price: 24, description: `${base}, milho, presunto, catupiry e hambúrguer 120g` },
  { category: "padrao", name: "X-Cheddar", price: 26, description: `${base}, milho, presunto, cheddar e hambúrguer 120g` },
  { category: "padrao", name: "Vegetariano", price: 20, description: `${base}, alface, tomate, milho, 2 ovos e 2 muçarelas`, badge: "Sem carne" },

  { category: "frango", name: "Frango Simples", price: 22, description: `${base}, muçarela e frango` },
  { category: "frango", name: "Frango Egg", price: 25, description: `${base}, muçarela, ovo e frango` },
  { category: "frango", name: "Frango Salada", price: 24, description: `${base}, alface, tomate, milho, muçarela e frango` },
  { category: "frango", name: "Frango Salada Egg", price: 27, description: `${base}, alface, tomate, milho, muçarela, ovo e frango` },
  { category: "frango", name: "Frango Bacon", price: 30, description: `${base}, alface, tomate, milho, bacon, muçarela e frango` },
  { category: "frango", name: "Frango Bacon Egg", price: 32, description: `${base}, alface, tomate, milho, bacon, muçarela, ovo e frango` },
  { category: "frango", name: "Frango Tudo", price: 35, description: `${base}, alface, tomate, milho, ovo, bacon, presunto, muçarela e frango` },
  { category: "frango", name: "Frango Grandão", price: 42, description: `${base}, alface, tomate, milho, 2 ovos, 2 bacons, 2 presuntos, 2 muçarelas e frango` },
  { category: "frango", name: "Frango Cheddar/Catupiry", price: 28, description: `${base}, milho, presunto, frango e cheddar ou catupiry` },

  { category: "artesanal", name: "Artesanal Simples", price: 23, description: `${base}, muçarela e hambúrguer gourmet 120g`, badge: "Artesanal" },
  { category: "artesanal", name: "Artesanal Egg", price: 25, description: `${base}, muçarela, ovo e hambúrguer gourmet 120g` },
  { category: "artesanal", name: "Artesanal Salada", price: 26, description: `${base}, alface, tomate, milho, muçarela e hambúrguer gourmet 120g` },
  { category: "artesanal", name: "Artesanal Salada Egg", price: 29, description: `${base}, alface, tomate, milho, muçarela, ovo e hambúrguer gourmet 120g` },
  { category: "artesanal", name: "Artesanal Bacon", price: 33, description: `${base}, alface, tomate, milho, bacon, muçarela e hambúrguer gourmet 120g` },
  { category: "artesanal", name: "Artesanal Bacon Egg", price: 35, description: `${base}, alface, tomate, milho, bacon, muçarela, ovo e hambúrguer gourmet 120g` },
  { category: "artesanal", name: "Artesanal Tudo", price: 38, description: `${base}, alface, tomate, milho, ovo, bacon, presunto, muçarela e hambúrguer gourmet 120g` },
  { category: "artesanal", name: "Artesanal Grandão", price: 42, description: `${base}, alface, tomate, milho, 2 ovos, 2 bacons, 2 presuntos, 2 muçarelas e hambúrguer gourmet 120g` },

  { category: "lombo", name: "Lombo Simples", price: 23, description: `${base}, muçarela e filé de lombo 120g` },
  { category: "lombo", name: "Lombo Egg", price: 24, description: `${base}, muçarela, ovo e filé de lombo 120g` },
  { category: "lombo", name: "Lombo Salada", price: 25, description: `${base}, alface, tomate, milho, muçarela e filé de lombo 120g` },
  { category: "lombo", name: "Lombo Salada Egg", price: 27, description: `${base}, alface, tomate, milho, muçarela, ovo e filé de lombo 120g` },
  { category: "lombo", name: "Lombo Bacon", price: 29, description: `${base}, alface, tomate, milho, bacon, muçarela e filé de lombo 120g` },
  { category: "lombo", name: "Lombo Bacon Egg", price: 33, description: `${base}, alface, tomate, milho, bacon, muçarela, ovo e filé de lombo 120g` },
  { category: "lombo", name: "Lombo Tudo", price: 35, description: `${base}, alface, tomate, milho, ovo, bacon, presunto, muçarela e filé de lombo 120g` },
  { category: "lombo", name: "Lombo Grandão", price: 42, description: `${base}, alface, tomate, milho, 2 ovos, 2 bacons, 2 presuntos, 2 muçarelas e filé de lombo 120g` },

  { category: "especiais", name: "Frango Desfiado", price: 27, description: "Pão, alface, tomate, maionese, frango desfiado com azeitona e 2 fatias de muçarela" },
  { category: "especiais", name: "Frango Desfiado Top", price: 30, description: "Pão, tomate, maionese, batata palha, frango desfiado com azeitona, 2 fatias de muçarela e cream cheese Philadelphia", badge: "Especial" },
  { category: "especiais", name: "Omelete", price: 28, description: "3 ovos, presunto, queijo, alface, tomate, milho, batata palha e uma carne: calabresa, bacon ou frango" },

  ...[
    ["Bacon", 10], ["Calabresa", 8], ["Catupiry", 6], ["Cebola", 2], ["Cheddar", 7],
    ["Frango", 10], ["Hambúrguer", 8], ["Hambúrguer Artesanal", 12], ["Lombo", 8],
    ["Milho", 3], ["Muçarela", 3], ["Ovo", 3], ["Presunto", 3],
  ].map(([name, price]) => ({ category: "adicionais", name: String(name), price: Number(price), description: "Adicione ao seu lanche preferido" })),

  ...[
    ["Refrigerante mini 200ml", 3], ["Refrigerante 350ml", 7], ["Refrigerante 600ml", 9],
    ["Refrigerante 1L", 11], ["Refrigerante 2L", 13], ["Coca-Cola 2L", 16],
    ["Água", 4], ["Água com gás", 4], ["Cerveja", 8], ["Suco Tial", 7],
  ].map(([name, price]) => ({ category: "bebidas", name: String(name), price: Number(price), description: "Geladinho para acompanhar" })),
];

const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const drinkRecommendations = products.filter(
  (product) =>
    product.category === "bebidas" &&
    ["Refrigerante 350ml", "Coca-Cola 2L", "Suco Tial"].includes(product.name),
);

export default function Home() {
  const [active, setActive] = useState("padrao");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [orderMode, setOrderMode] = useState<"entrega" | "retirada">("entrega");
  const [address, setAddress] = useState("");

  const visible = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return products.filter(
      (product) =>
        (!term && product.category === active) ||
        (term && `${product.name} ${product.description}`.toLocaleLowerCase("pt-BR").includes(term)),
    );
  }, [active, search]);

  const quantity = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  const total = Object.values(cart).reduce((sum, item) => sum + item.price * item.quantity, 0);

  const add = (product: Product) => {
    setCart((current) => ({
      ...current,
      [product.name]: { ...product, quantity: (current[product.name]?.quantity ?? 0) + 1 },
    }));
  };

  const change = (name: string, delta: number) => {
    setCart((current) => {
      const next = { ...current };
      const item = next[name];
      if (!item) return current;
      if (item.quantity + delta <= 0) delete next[name];
      else next[name] = { ...item, quantity: item.quantity + delta };
      return next;
    });
  };

  const sendOrder = () => {
    const lines = Object.values(cart).map(
      (item) => `• ${item.quantity}x ${item.name} — ${money(item.price * item.quantity)}`,
    );
    const message = [
      "Olá, Ponto Z! Quero fazer um pedido:",
      "",
      ...lines,
      "",
      `Total dos itens: ${money(total)}`,
      "",
      `Nome: ${customerName.trim()}`,
      orderMode === "entrega" ? `Entrega em: ${address.trim()}` : "Forma de recebimento: Retirada no balcão",
      "Forma de pagamento:",
    ].join("\n");
    window.open(`https://wa.me/5535997240245?text=${encodeURIComponent(message)}`, "_blank");
  };

  const keepShopping = () => {
    setCartOpen(false);
    window.setTimeout(() => document.querySelector("#cardapio")?.scrollIntoView({ behavior: "smooth" }), 80);
  };

  const categoryName = search
    ? `Resultados para “${search}”`
    : categories.find((category) => category.id === active)?.label;

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Ponto Z - início">
          <span className="brand-logo" aria-hidden="true" />
          <span>
            <strong>Ponto Z</strong>
            <small>Hamburgueria tradicional</small>
          </span>
        </a>
        <div className="header-actions">
          <a href="https://www.instagram.com/pontoz_hamburgueria/" target="_blank" rel="noreferrer">
            Instagram
          </a>
          <button className="cart-button" onClick={() => setCartOpen(true)} aria-label={`Abrir carrinho com ${quantity} itens`}>
            Sacola <span>{quantity}</span>
          </button>
        </div>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <span className="eyebrow">Desde sempre, do seu jeito</span>
          <h1>Seu lanche favorito está a poucos cliques.</h1>
          <p>Escolha, monte sua sacola e envie o pedido direto para o nosso WhatsApp.</p>
          <div className="hero-meta">
            <span><b>📍</b> Jd. Glória, Lavras</span>
            <span><b>☎</b> (35) 99724-0245</span>
          </div>
        </div>
        <div className="hero-art" aria-label="Hambúrguer artesanal da Ponto Z">
          <div className="hero-photo" role="img" aria-label="Hambúrguer com queijo, bacon, alface e tomate" />
          <span className="hero-stamp">Feito na<br /><b>chapa</b></span>
        </div>
      </section>

      <section className="store-strip">
        <div><span className="status-dot" /><b>Consulte o horário</b><small>Pedidos pelo WhatsApp</small></div>
        <div><b>Delivery e retirada</b><small>Confirme prazo e taxa no pedido</small></div>
        <div><b>Rua Evaristo Gomes Guerra, 509</b><small>Jardim Glória · Lavras/MG</small></div>
      </section>

      <section className="menu-shell" id="cardapio">
        <div className="menu-heading">
          <div>
            <span className="eyebrow dark">Explore o cardápio</span>
            <h2>O que vai ser hoje?</h2>
          </div>
          <label className="search">
            <span>⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar no cardápio"
              aria-label="Buscar no cardápio"
            />
          </label>
        </div>

        <nav className="categories" aria-label="Categorias do cardápio">
          {categories.map((category) => (
            <button
              key={category.id}
              className={active === category.id && !search ? "active" : ""}
              onClick={() => { setActive(category.id); setSearch(""); }}
            >
              <span>{category.icon}</span>{category.label}
            </button>
          ))}
        </nav>

        <div className="section-title">
          <h3>{categoryName}</h3>
          <span>{visible.length} {visible.length === 1 ? "item" : "itens"}</span>
        </div>

        <div className="product-grid">
          {visible.map((product) => (
            <article className="product-card" key={`${product.category}-${product.name}`}>
              <div>
                {product.badge && <span className="product-badge">{product.badge}</span>}
                <h4>{product.name}</h4>
                <p>{product.description}</p>
              </div>
              <div className="product-footer">
                <strong>{money(product.price)}</strong>
                <button onClick={() => add(product)} aria-label={`Adicionar ${product.name} à sacola`}>+</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer>
        <div className="footer-brand">
          <span className="brand-logo small" aria-hidden="true" />
          <div><strong>Ponto Z Hamburgueria</strong><small>Tradição em cada mordida.</small></div>
        </div>
        <div>
          <b>Faça seu pedido</b>
          <a href="https://wa.me/5535997240245" target="_blank" rel="noreferrer">(35) 99724-0245</a>
        </div>
        <div>
          <b>Onde estamos</b>
          <span>Rua Evaristo Gomes Guerra, 509<br />Jd. Glória · Lavras/MG</span>
        </div>
      </footer>

      {quantity > 0 && (
        <button className="floating-cart" onClick={() => setCartOpen(true)}>
          <span>{quantity} {quantity === 1 ? "item" : "itens"}</span>
          <b>Ver sacola · {money(total)}</b>
        </button>
      )}

      {cartOpen && (
        <div className="drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setCartOpen(false)}>
          <aside className="cart-drawer" aria-label="Sua sacola">
            <div className="drawer-header">
              <div><span className="eyebrow dark">Seu pedido</span><h2>Sua sacola</h2></div>
              <button onClick={() => setCartOpen(false)} aria-label="Fechar sacola">×</button>
            </div>
            <div className="cart-list">
              {quantity === 0 ? (
                <div className="empty-cart"><span>🍔</span><h3>Sua sacola está vazia</h3><p>Adicione seus favoritos para começar.</p></div>
              ) : Object.values(cart).map((item) => (
                <div className="cart-item" key={item.name}>
                  <div><b>{item.name}</b><span>{money(item.price)}</span></div>
                  <div className="stepper">
                    <button onClick={() => change(item.name, -1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => change(item.name, 1)}>+</button>
                  </div>
                </div>
              ))}
              {quantity > 0 && (
                <section className="cart-suggestions" aria-labelledby="drink-suggestions-title">
                  <div className="suggestions-heading">
                    <div>
                      <span className="eyebrow dark">Que tal uma bebida?</span>
                      <h3 id="drink-suggestions-title">Complete seu pedido</h3>
                    </div>
                    <span>🥤</span>
                  </div>
                  <div className="suggestion-list">
                    {drinkRecommendations.map((drink) => (
                      <div className="suggestion-item" key={drink.name}>
                        <div>
                          <b>{drink.name}</b>
                          <span>{money(drink.price)}</span>
                        </div>
                        <button onClick={() => add(drink)} aria-label={`Adicionar ${drink.name}`}>
                          {cart[drink.name] ? `+1 (${cart[drink.name].quantity})` : "Adicionar"}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
            {quantity > 0 && (
              <div className="drawer-footer">
                <button className="keep-shopping" onClick={keepShopping}>
                  <span>＋</span> Adicionar mais itens
                </button>
                <section className="checkout-details" aria-labelledby="checkout-title">
                  <div className="checkout-title">
                    <span className="eyebrow dark">Dados do pedido</span>
                    <h3 id="checkout-title">Como você quer receber?</h3>
                  </div>
                  <label>
                    <span>Seu nome</span>
                    <input
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                      placeholder="Digite seu nome"
                      autoComplete="name"
                    />
                  </label>
                  <div className="order-mode" role="group" aria-label="Forma de recebimento">
                    <button
                      className={orderMode === "entrega" ? "selected" : ""}
                      onClick={() => setOrderMode("entrega")}
                    >
                      <span>🛵</span>
                      <b>Entrega</b>
                      <small>Receber em casa</small>
                    </button>
                    <button
                      className={orderMode === "retirada" ? "selected" : ""}
                      onClick={() => setOrderMode("retirada")}
                    >
                      <span>🏪</span>
                      <b>Retirada</b>
                      <small>Buscar no balcão</small>
                    </button>
                  </div>
                  {orderMode === "entrega" && (
                    <label>
                      <span>Endereço para entrega</span>
                      <textarea
                        value={address}
                        onChange={(event) => setAddress(event.target.value)}
                        placeholder="Rua, número, bairro e complemento"
                        autoComplete="street-address"
                        rows={2}
                      />
                    </label>
                  )}
                </section>
                <div><span>Total dos itens</span><b>{money(total)}</b></div>
                <small>Taxa de entrega e prazo serão confirmados no WhatsApp.</small>
                <button
                  className="whatsapp-order"
                  onClick={sendOrder}
                  disabled={!customerName.trim() || (orderMode === "entrega" && !address.trim())}
                >
                  Enviar pedido no WhatsApp <span>↗</span>
                </button>
                {(!customerName.trim() || (orderMode === "entrega" && !address.trim())) && (
                  <p className="form-hint">Preencha seu nome{orderMode === "entrega" ? " e endereço" : ""} para continuar.</p>
                )}
              </div>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
