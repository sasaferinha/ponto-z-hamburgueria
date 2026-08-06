"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  name: string;
  price: number;
  description: string;
  category: string;
  badge?: string;
  group?: string;
};

type AddOn = { name: string; price: number };
type CartItem = Product & { id: string; quantity: number; addOns: AddOn[] };

const categories = [
  { id: "padrao", label: "Tradicionais" },
  { id: "bebidas", label: "Bebidas" },
  { id: "frango", label: "Frango" },
  { id: "artesanal", label: "Artesanais" },
  { id: "lombo", label: "Lombo" },
  { id: "especiais", label: "Especiais" },
  { id: "batatas", label: "Batata frita" },
  { id: "adicionais", label: "Adicionais" },
];

const beverageGroupOrder = [
  "Refrigerantes 350 ml", "Sucos Tial", "Sucos Del Valle", "Refrigerantes Mini 200 ml",
  "Refrigerantes 600 ml", "Refrigerantes 1 litro", "Refrigerantes 2 litros", "Outras bebidas",
];

const lavrasNeighborhoods = [
  "Aeroporto", "Alta Villa Bom Jesus", "Alta Villa Lavras", "Alta Vista", "Alto do Cruzeiro", "Alvorada",
  "Amadeu Pinheiro", "Anísio Alves de Abreu", "Aquenta Sol", "Área Rural de Lavras", "Artur Bernardes", "Baunilha",
  "Belizanda", "Belo Horizonte", "Belo Monte", "Bicame", "Boa Vista", "Brisas da Serra", "Caminhos da Serra",
  "Cascalho", "Cecília Azevedo", "Centenário", "Centro", "Centro Empresarial de Lavras", "Chácara São Geraldo",
  "Chácara Serra Bella", "Chácaras da Serra", "Charquinho", "Cidade da Serra", "Colinas da Serra",
  "Colinas da Serra III", "Colinas da Serra IV", "Comunidade do Funil", "Condomínio Aldeia de Sagres",
  "Condomínio das Goiabeiras", "Condomínio Dharma Ville", "Condomínio Flamboyants", "Condomínio Jardim das Palmeiras",
  "Condomínio Lagoa dos Ipês", "Condomínio Montserrat", "Condomínio Reserva do Funil",
  "Condomínio Residencial Lavras Parque I", "Condomínio Stone Village", "Conjunto Habitacional Água Limpa",
  "Conjunto Habitacional Alto dos Ipês", "Conjunto Habitacional Cidade Nova", "Conjunto Habitacional João da Cruz Botrel",
  "Conjunto Habitacional Júlio Sidney Pinto", "Conjunto Habitacional Residencial Caminho das Águas",
  "Conjunto Habitacional Residencial Caminho das Águas II", "Costa Pinto", "Cruzeiro do Sul",
  "Distrito Industrial Deputado Sylvio Menicucci", "Distrito Industrial II", "Distrito Industrial III", "Dona Flor",
  "Dona Irene", "Dona Julieta", "Dona Odete", "Dos Ipês", "Doutor João Ribeiro", "Doutor Paulo Menicucci",
  "Esplanada", "Fátima", "Gato Preto", "Ignácio Valentini", "Jardim América", "Jardim Bela Vista",
  "Jardim Campestre", "Jardim Campestre II", "Jardim Campestre III", "Jardim das Acácias", "Jardim das Alterosas",
  "Jardim das Magnólias", "Jardim das Magnólias II", "Jardim Dona Wanda", "Jardim Eldorado", "Jardim Europa",
  "Jardim Fabiana", "Jardim Floresta", "Jardim Glória", "Jardim Itália", "Jardim Klintiana", "Jardim Rio Bonito",
  "Jardim Samauma", "Jardim São Carlos", "Jardim São Paulo", "Jardim Vila Rica", "Lavras Shopping", "Lavrinhas",
  "Manoel Alves", "Martins", "Monte Líbano", "Monte Líbano II", "Monte Líbano III", "Morada do Sol",
  "Morada do Sol II", "Morada do Sol III", "Niterói", "Nossa Senhora Aparecida", "Nossa Senhora de Lourdes",
  "Nossa Senhora de Lourdes II", "Nossa Senhora do Líbano", "Nova Lavras", "Novo Água Limpa", "Novo Água Limpa II",
  "Olaria", "Ouro Branco", "Ouro Preto", "Ouro Verde", "Padre Dehon", "Parque Belvedere", "Parque Bocaina",
  "Parque Bocaina II", "Parque das Pedras Preciosas", "Parque dos Ipês", "Parque Imperial", "Pedro Silvestre",
  "Planalto", "Portal da Mata", "Portal da Serra", "Presidente Kennedy", "Província de Lucca", "Reserva Real",
  "Residencial Agyo", "Residencial Alphaville", "Residencial Antônio Cherem", "Residencial a Vencedora",
  "Residencial Bela Vista", "Residencial Bouganville", "Residencial Fonte Verde", "Residencial Jardins",
  "Residencial Judith Cândido Andrade", "Residencial Londres", "Residencial Mundo Novo", "Residencial Nova Era",
  "Residencial Nova Era II", "Residencial Nova Era III", "Residencial Parque Leste", "Residencial Sant'ana I",
  "Residencial Tipuana", "Residencial Tipuana II", "Residencial Vista do Lago", "Retiro", "Santa Cruz",
  "Santa Efigênia", "Santa Filomena", "São Vicente", "Serra Azul", "Serra Verde", "Sub-Estação",
  "Universidade Federal de Lavras", "Vale do Sol", "Vila Alzira", "Vila Bandeirantes", "Vila Brasília", "Vila Ester",
  "Vila Glória", "Vila Joaquim Sales", "Vila José Vilela", "Vila Mariana", "Vila Menicucci", "Vila Murad",
  "Vila Nílton Teixeira", "Vila Paraíso", "Vila Pitangui", "Vila Rosalina", "Vila Santa Terezinha",
  "Vila São Camilo", "Vila São Francisco", "Vila São Sebastião", "Vila Vera Cruz", "Villa da Serra",
  "Villa da Serra - 1ª Ampliação", "Vista Alegre", "Vista do Funil", "Novo Horizonte", "Jardim Santana", "Cohab", "Outro / não encontrei",
];

const deliveryFees: Record<string, number> = {
  "Jardim Glória": 6,
  "Vila São Francisco": 6,
  "Residencial Nova Era": 8,
  "Residencial Nova Era II": 8,
  "Residencial Nova Era III": 8,
  "Jardim das Acácias": 8,
  "Jardim Campestre": 8,
  "Jardim Campestre II": 8,
  "Jardim Campestre III": 8,
  "Morada do Sol": 8,
  "Morada do Sol II": 8,
  "Morada do Sol III": 8,
  "Jardim Klintiana": 8,
  "Belizanda": 8,
  "Vila Joaquim Sales": 8,
  "Serra Azul": 8,
  "Dona Julieta": 8,
  "Ouro Preto": 8,
  "Ouro Branco": 8,
  "Conjunto Habitacional Água Limpa": 10,
  "Novo Água Limpa": 10,
  "Novo Água Limpa II": 10,
  "Novo Horizonte": 10,
  "Residencial Fonte Verde": 15,
  "Residencial Mundo Novo": 10,
  "Vila Murad": 8,
  "Jardim Floresta": 8,
  "Centro": 8,
  "Centenário": 8,
  "Cruzeiro do Sul": 8,
  "Jardim das Alterosas": 8,
  "Vila Pitangui": 8,
  "Vale do Sol": 10,
  "Jardim Bela Vista": 10,
  "Residencial Bela Vista": 10,
  "Jardim das Magnólias": 10,
  "Jardim das Magnólias II": 10,
  "Serra Verde": 10,
  "Parque Bocaina": 10,
  "Parque Bocaina II": 10,
  "Colinas da Serra": 10,
  "Colinas da Serra III": 10,
  "Colinas da Serra IV": 10,
  "Portal da Serra": 10,
  "Vista Alegre": 10,
  "Aeroporto": 10,
  "Santa Cruz": 10,
  "Jardim Santana": 10,
  "Olaria": 8,
  "Universidade Federal de Lavras": 10,
  "Aquenta Sol": 8,
  "Lavrinhas": 8,
  "Nossa Senhora de Lourdes": 8,
  "Nossa Senhora de Lourdes II": 8,
  "Cohab": 8,
  "Conjunto Habitacional Cidade Nova": 10,
  "Residencial Judith Cândido Andrade": 10,
  "Residencial Vista do Lago": 10,
  "Conjunto Habitacional Residencial Caminho das Águas": 10,
  "Conjunto Habitacional Residencial Caminho das Águas II": 10,
  "Portal da Mata": 15,
};

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

  { category: "batatas", name: "Batata frita pequena", price: 10, description: "Porção de 150g acompanhada de dois molhos da casa", badge: "150g" },
  { category: "batatas", name: "Batata frita média", price: 15, description: "Porção de 250g acompanhada de dois molhos da casa", badge: "250g" },
  { category: "batatas", name: "Batata frita grande", price: 25, description: "Porção de 500g acompanhada de dois molhos da casa", badge: "500g" },
  { category: "batatas", name: "Batata com cheddar e bacon", price: 35, description: "Porção de 500g com cheddar e bacon, acompanhada de dois molhos da casa", badge: "Especial" },

  ...[
    ["Bacon", 10], ["Calabresa", 8], ["Catupiry", 6], ["Cebola", 2], ["Cheddar", 7],
    ["Frango", 10], ["Hambúrguer", 8], ["Hambúrguer Artesanal", 12], ["Lombo", 8],
    ["Milho", 3], ["Muçarela", 3], ["Ovo", 3], ["Presunto", 3],
  ].map(([name, price]) => ({ category: "adicionais", name: String(name), price: Number(price), description: "Adicione ao seu lanche preferido" })),

  ...[
    ["Coca-Cola 350ml", 7], ["Coca-Cola Zero 350ml", 7], ["Sprite 350ml", 7], ["Guaraná 350ml", 7],
    ["Fanta Laranja 350ml", 7], ["Fanta Maracujá 350ml", 7], ["Fanta Uva 350ml", 7],
    ["Suco Tial Manga", 7], ["Suco Tial Goiaba", 7], ["Suco Tial Laranja", 7],
    ["Suco Tial Maracujá", 7], ["Suco Tial Pêssego", 7],
    ["Suco Del Valle Uva", 7], ["Suco Del Valle Pêssego", 7], ["Suco Del Valle Goiaba", 7], ["Suco Del Valle Manga", 7],
    ["Coca-Cola Mini 200ml", 3], ["Fanta Laranja Mini 200ml", 3], ["Pepsi Mini 200ml", 3],
    ["Sprite 600ml", 9], ["Fanta Uva 600ml", 9], ["Fanta Laranja 600ml", 9],
    ["Coca-Cola 600ml", 9], ["Coca-Cola Zero 600ml", 9],
    ["Fanta Laranja 1L", 11], ["Pepsi 1L", 11], ["Guaraná 1L", 11],
    ["Fanta Laranja 2L", 13], ["Fanta Uva 2L", 13], ["Fanta Guaraná 2L", 13],
    ["Coca-Cola 2L", 16], ["Sprite 2L", 13], ["Sprite Zero 2L", 13],
    ["Água", 4], ["Água com gás", 4], ["Cerveja", 8],
  ].map(([name, price]) => {
    const beverageName = String(name);
    const group = beverageName.startsWith("Suco Tial") ? "Sucos Tial"
      : beverageName.startsWith("Suco Del Valle") ? "Sucos Del Valle"
      : beverageName.includes("Mini 200ml") ? "Refrigerantes Mini 200 ml"
      : beverageName.includes("350ml") ? "Refrigerantes 350 ml"
      : beverageName.includes("600ml") ? "Refrigerantes 600 ml"
      : beverageName.includes("1L") ? "Refrigerantes 1 litro"
      : beverageName.includes("2L") ? "Refrigerantes 2 litros"
      : "Outras bebidas";
    return { category: "bebidas", name: beverageName, price: Number(price), description: "Geladinho para acompanhar", group };
  }),
];

const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const addOns: AddOn[] = products
  .filter((product) => product.category === "adicionais")
  .map(({ name, price }) => ({ name, price }));

const friesAddOns: AddOn[] = [
  { name: "Cheddar", price: 6 },
  { name: "Catupiry", price: 6 },
  { name: "Bacon", price: 8 },
  { name: "Queijo", price: 6 },
];

const customizableCategories = new Set(["padrao", "frango", "artesanal", "lombo", "especiais", "batatas"]);

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
  const [customizing, setCustomizing] = useState<Product | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderMode, setOrderMode] = useState<"entrega" | "retirada" | "local">("entrega");
  const [neighborhood, setNeighborhood] = useState("");
  const [street, setStreet] = useState("");
  const [addressDetails, setAddressDetails] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cashChangeChoice, setCashChangeChoice] = useState<"" | "yes" | "no">("");
  const [cashAmount, setCashAmount] = useState("");
  const [sendingOrder, setSendingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [storeSettings, setStoreSettings] = useState({ isOpen: true, deliveryTime: "40 a 60 minutos", pickupTime: "20 a 30 minutos", openingHours: "18h às 00h" });

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => data?.settings && setStoreSettings(data.settings))
      .catch(() => undefined);
  }, []);

  const visible = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return products.filter(
      (product) =>
        (!term && product.category === active) ||
        (term && `${product.name} ${product.description}`.toLocaleLowerCase("pt-BR").includes(term)),
    );
  }, [active, search]);

  const quantity = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  const total = Object.values(cart).reduce(
    (sum, item) => sum + (item.price + item.addOns.reduce((extras, addOn) => extras + addOn.price, 0)) * item.quantity,
    0,
  );
  const deliveryFee = orderMode === "entrega" ? deliveryFees[neighborhood] : 0;
  const orderTotal = total + (deliveryFee ?? 0);
  const cashAmountValue = (() => {
    const normalized = cashAmount.trim().replace(/[^\d.,]/g, "");
    return Number(normalized.includes(",") ? normalized.replace(/\./g, "").replace(",", ".") : normalized);
  })();
  const cashChangeMissing = orderMode !== "local" && paymentMethod === "Dinheiro" && !cashChangeChoice;
  const customerPhoneDigits = customerPhone.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  const customerPhoneInvalid = !/^\d{10,11}$/.test(customerPhoneDigits);
  const cashAmountInvalid = orderMode !== "local" && paymentMethod === "Dinheiro" && cashChangeChoice === "yes" &&
    (!cashAmount.trim() || !Number.isFinite(cashAmountValue) || cashAmountValue < orderTotal);
  const currentAddOns = customizing?.category === "batatas" ? friesAddOns : addOns;

  const addDirect = (product: Product) => {
    setCart((current) => ({
      ...current,
      [product.name]: {
        ...product,
        id: product.name,
        addOns: [],
        quantity: (current[product.name]?.quantity ?? 0) + 1,
      },
    }));
  };

  const startAdd = (product: Product) => {
    if (!customizableCategories.has(product.category)) {
      addDirect(product);
      return;
    }
    setSelectedAddOns([]);
    setCustomizing(product);
  };

  const toggleAddOn = (name: string) => {
    setSelectedAddOns((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
    );
  };

  const confirmCustomizedProduct = () => {
    if (!customizing) return;
    const extras = currentAddOns.filter((addOn) => selectedAddOns.includes(addOn.name));
    const signature = extras.map((addOn) => addOn.name).sort().join("+") || "sem-adicional";
    const id = `${customizing.name}::${signature}`;
    setCart((current) => ({
      ...current,
      [id]: {
        ...customizing,
        id,
        addOns: extras,
        quantity: (current[id]?.quantity ?? 0) + 1,
      },
    }));
    setCustomizing(null);
    setSelectedAddOns([]);
    setCartOpen(true);
  };

  const change = (id: string, delta: number) => {
    setCart((current) => {
      const next = { ...current };
      const item = next[id];
      if (!item) return current;
      if (item.quantity + delta <= 0) delete next[id];
      else next[id] = { ...item, quantity: item.quantity + delta };
      return next;
    });
  };

  const sendOrder = async () => {
    setSendingOrder(true);
    setOrderError("");
    const lines = Object.values(cart).flatMap((item) => {
      return [
        `• ${item.quantity}x ${item.name} — ${money(item.price * item.quantity)}`,
        ...item.addOns.map((addOn) => `   + ${addOn.name} — ${money(addOn.price)} por lanche`),
      ];
    });
    const message = [
      "Olá, Ponto Z! Quero fazer um pedido:",
      "",
      ...lines,
      "",
      `Subtotal dos itens: ${money(total)}`,
      ...(orderMode === "entrega"
        ? [deliveryFee !== undefined ? `Taxa de entrega: ${money(deliveryFee)}` : "Taxa de entrega: a confirmar"]
        : []),
      `Total do pedido: ${money(orderTotal)}`,
      "",
      `Nome: ${customerName.trim()}`,
      orderMode === "entrega"
        ? `Entrega em: ${street.trim()}, ${addressDetails.trim() || "sem número informado"} - Bairro ${neighborhood.trim()}`
        : orderMode === "local" ? "Forma de recebimento: Comer no estabelecimento" : "Forma de recebimento: Retirada no balcão",
      orderMode === "entrega"
        ? `Tempo estimado de entrega: ${storeSettings.deliveryTime}`
        : orderMode === "retirada" ? `Tempo estimado de retirada: ${storeSettings.pickupTime}` : "",
      ...(orderMode === "local" ? [] : [`Forma de pagamento: ${paymentMethod}`]),
      ...(orderMode !== "local" && paymentMethod === "Dinheiro"
        ? [cashChangeChoice === "yes" ? `Troco para: ${money(cashAmountValue)}` : "Troco: não precisa"]
        : []),
    ].join("\n");
    const whatsappWindow = window.open("about:blank", "_blank");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName, customerPhone: customerPhoneDigits, orderMode, neighborhood, street, addressDetails, paymentMethod,
          cashChangeChoice, cashAmount: cashChangeChoice === "yes" ? cashAmountValue : undefined,
          total: orderTotal,
          items: [
            ...Object.values(cart).map(({ name, quantity, price, addOns }) => ({ name, quantity, price, addOns })),
            ...(orderMode === "entrega" && deliveryFee !== undefined
              ? [{ name: "Taxa de entrega", quantity: 1, price: deliveryFee, addOns: [] }]
              : []),
          ],
        }),
      });
      if (!response.ok) throw new Error("Não foi possível registrar o pedido");
      const destination = `https://wa.me/5535997240245?text=${encodeURIComponent(message)}`;
      if (whatsappWindow) whatsappWindow.location.href = destination;
      else window.location.href = destination;
    } catch {
      whatsappWindow?.close();
      setOrderError("Não foi possível registrar o pedido. Tente novamente em alguns instantes.");
    } finally {
      setSendingOrder(false);
    }
  };

  const keepShopping = () => {
    setCartOpen(false);
    window.setTimeout(() => document.querySelector("#cardapio")?.scrollIntoView({ behavior: "smooth" }), 80);
  };

  const categoryName = search
    ? `Resultados para “${search}”`
    : categories.find((category) => category.id === active)?.label;

  const renderProductCard = (product: Product) => (
    <article className="product-card" key={`${product.category}-${product.name}`}>
      <div>
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <h4>{product.name}</h4>
        <p>{product.description}</p>
      </div>
      <div className="product-footer">
        <strong>{money(product.price)}</strong>
        <button onClick={() => startAdd(product)} aria-label={`Adicionar ${product.name} à sacola`}>+</button>
      </div>
    </article>
  );

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
            <span><b>Local</b> Jd. Glória, Lavras</span>
            <span><b>Pedidos</b> (35) 99724-0245</span>
          </div>
        </div>
        <div className="hero-art" aria-label="Hambúrguer artesanal da Ponto Z">
          <div className="hero-photo">
            <img src="/og.png" alt="Hambúrguer com queijo, bacon, alface e tomate" />
          </div>
        </div>
      </section>

      <section className="store-strip">
        <div className={storeSettings.isOpen ? "store-open" : "store-closed"}><span className="status-dot" /><b>{storeSettings.isOpen ? "Aberto agora" : "Fechado no momento"}</b><small>Funcionamento: {storeSettings.openingHours}</small></div>
        <div><b>Delivery e retirada</b><small>{storeSettings.isOpen ? `Entrega: ${storeSettings.deliveryTime} · Retirada: ${storeSettings.pickupTime}` : "Novos pedidos temporariamente pausados"}</small></div>
        <div><b>Rua Evaristo Gomes Guerra, 509</b><small>Jardim Glória · Lavras/MG</small></div>
      </section>

      <section className="menu-shell" id="cardapio">
        <div className="menu-heading">
          <div>
            <span className="eyebrow dark">Explore o cardápio</span>
            <h2>O que vai ser hoje?</h2>
          </div>
          <label className="search">
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
              {category.label}
            </button>
          ))}
        </nav>

        <div className="section-title">
          <h3>{categoryName}</h3>
          <span>{visible.length} {visible.length === 1 ? "item" : "itens"}</span>
        </div>

        {active === "bebidas" && !search ? (
          <div className="beverage-sections">
            {beverageGroupOrder.map((group) => {
              const groupProducts = visible.filter((product) => product.group === group);
              if (!groupProducts.length) return null;
              return (
                <section className="beverage-section" key={group}>
                  <div className="beverage-group-heading"><h4>{group}</h4><span>{groupProducts.length} opções</span></div>
                  <div className="product-grid">{groupProducts.map(renderProductCard)}</div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="product-grid">{visible.map(renderProductCard)}</div>
        )}
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

      {customizing && (
        <div className="customizer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setCustomizing(null)}>
          <section className="customizer" role="dialog" aria-modal="true" aria-labelledby="customizer-title">
            <div className="customizer-header">
              <div>
                <span className="eyebrow dark">{customizing.category === "batatas" ? "Personalize sua batata" : "Personalize seu lanche"}</span>
                <h2 id="customizer-title">{customizing.name}</h2>
                <p>Escolha os adicionais que deseja. Esta etapa é opcional.</p>
              </div>
              <button onClick={() => setCustomizing(null)} aria-label="Fechar adicionais">×</button>
            </div>
            <div className="addon-list">
              {currentAddOns.map((addOn) => {
                const selected = selectedAddOns.includes(addOn.name);
                return (
                  <button
                    className={selected ? "selected" : ""}
                    key={addOn.name}
                    onClick={() => toggleAddOn(addOn.name)}
                    aria-pressed={selected}
                  >
                    <span className="addon-check">{selected ? "✓" : "+"}</span>
                    <span><b>{addOn.name}</b><small>{money(addOn.price)}</small></span>
                  </button>
                );
              })}
            </div>
            <div className="customizer-total">
              <span>Total deste lanche</span>
              <b>
                {money(
                  customizing.price +
                    currentAddOns
                      .filter((addOn) => selectedAddOns.includes(addOn.name))
                      .reduce((sum, addOn) => sum + addOn.price, 0),
                )}
              </b>
            </div>
            <button className="confirm-customization" onClick={confirmCustomizedProduct}>
              {selectedAddOns.length ? "Adicionar com adicionais" : "Adicionar sem adicionais"}
            </button>
          </section>
        </div>
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
                <div className="empty-cart"><span>PZ</span><h3>Sua sacola está vazia</h3><p>Adicione seus favoritos para começar.</p></div>
              ) : Object.values(cart).map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-info">
                    <b>{item.name}</b>
                    <span>{money(item.price)}</span>
                    {item.addOns.length > 0 && (
                      <ul className="cart-addons">
                        {item.addOns.map((addOn) => (
                          <li key={addOn.name}><span>+ {addOn.name}</span><span>{money(addOn.price)}</span></li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="stepper">
                    <button onClick={() => change(item.id, -1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => change(item.id, 1)}>+</button>
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
                  </div>
                  <div className="suggestion-list">
                    {drinkRecommendations.map((drink) => (
                      <div className="suggestion-item" key={drink.name}>
                        <div>
                          <b>{drink.name}</b>
                          <span>{money(drink.price)}</span>
                        </div>
                        <button onClick={() => addDirect(drink)} aria-label={`Adicionar ${drink.name}`}>
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
                  <label>
                    <span>Seu WhatsApp com DDD</span>
                    <input
                      value={customerPhone}
                      onChange={(event) => setCustomerPhone(event.target.value)}
                      placeholder="Ex.: (35) 99999-9999"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      maxLength={18}
                      required
                      aria-invalid={customerPhone.length > 0 && customerPhoneInvalid}
                    />
                  </label>
                  <div className="order-mode" role="group" aria-label="Forma de recebimento">
                    <button
                      className={orderMode === "entrega" ? "selected" : ""}
                      onClick={() => setOrderMode("entrega")}
                    >
                      <span className="mode-mark">E</span>
                      <b>Entrega</b>
                      <small>Receber em casa</small>
                    </button>
                    <button
                      className={orderMode === "retirada" ? "selected" : ""}
                      onClick={() => setOrderMode("retirada")}
                    >
                      <span className="mode-mark">R</span>
                      <b>Retirada</b>
                      <small>Buscar no balcão</small>
                    </button>
                    <button
                      className={orderMode === "local" ? "selected" : ""}
                      onClick={() => setOrderMode("local")}
                    >
                      <span className="mode-mark">M</span>
                      <b>Comer no estabelecimento</b>
                      <small>Fazer a refeição no local</small>
                    </button>
                  </div>
                  {orderMode === "entrega" && (
                    <div className="address-fields">
                      <label>
                        <span>Seu bairro</span>
                        <select
                          value={neighborhood}
                          onChange={(event) => setNeighborhood(event.target.value)}
                          autoComplete="address-level3"
                        >
                          <option value="" disabled>Selecione seu bairro</option>
                          {lavrasNeighborhoods.map((item) => (
                            <option value={item} key={item}>
                              {item}{deliveryFees[item] !== undefined ? ` — ${money(deliveryFees[item])}` : ""}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>Sua rua</span>
                        <input
                          value={street}
                          onChange={(event) => setStreet(event.target.value)}
                          placeholder="Digite o nome da rua"
                          autoComplete="address-line1"
                        />
                      </label>
                      <label>
                        <span>Número e complemento</span>
                        <input
                          value={addressDetails}
                          onChange={(event) => setAddressDetails(event.target.value)}
                          placeholder="Ex.: 509, casa 2"
                          autoComplete="address-line2"
                        />
                      </label>
                      <p className="delivery-notice">
                        {neighborhood && deliveryFee !== undefined
                          ? `Taxa de entrega para ${neighborhood}: ${money(deliveryFee)}`
                          : "Selecione um bairro cadastrado para consultar a taxa. Outros locais serão confirmados pelo WhatsApp."}
                      </p>
                    </div>
                  )}
                  {orderMode !== "local" && <fieldset className="payment-fieldset">
                    <legend>Forma de pagamento</legend>
                    <div className="payment-mode" role="radiogroup" aria-label="Forma de pagamento">
                      {["Pix", "Dinheiro", "Cartão de crédito", "Cartão de débito"].map((method) => (
                        <button
                          type="button"
                          role="radio"
                          aria-checked={paymentMethod === method}
                          className={paymentMethod === method ? "selected" : ""}
                          onClick={() => setPaymentMethod(method)}
                          key={method}
                        >
                          <span className="payment-mark" aria-hidden="true" />
                          <b>{method}</b>
                        </button>
                      ))}
                    </div>
                    {paymentMethod === "Dinheiro" && (
                      <div className="cash-change-box">
                        <span>Você precisa de troco?</span>
                        <div className="cash-change-options" role="radiogroup" aria-label="Precisa de troco?">
                          <button
                            type="button"
                            role="radio"
                            aria-checked={cashChangeChoice === "no"}
                            className={cashChangeChoice === "no" ? "selected" : ""}
                            onClick={() => { setCashChangeChoice("no"); setCashAmount(""); }}
                          >Não preciso</button>
                          <button
                            type="button"
                            role="radio"
                            aria-checked={cashChangeChoice === "yes"}
                            className={cashChangeChoice === "yes" ? "selected" : ""}
                            onClick={() => setCashChangeChoice("yes")}
                          >Preciso de troco</button>
                        </div>
                        {cashChangeChoice === "yes" && (
                          <label className="cash-change-field">
                            <span>Troco para quanto?</span>
                            <input
                              value={cashAmount}
                              onChange={(event) => setCashAmount(event.target.value)}
                              placeholder="Ex.: 50,00"
                              inputMode="decimal"
                              autoComplete="off"
                              maxLength={12}
                              required
                              aria-invalid={cashAmountInvalid}
                            />
                            {cashAmountInvalid && <em>Informe um valor igual ou maior que {money(orderTotal)}.</em>}
                          </label>
                        )}
                      </div>
                    )}
                  </fieldset>}
                </section>
                <div className="order-summary">
                  <div><span>Subtotal dos itens</span><b>{money(total)}</b></div>
                  {orderMode === "entrega" && (
                    <div><span>Taxa de entrega</span><b>{deliveryFee !== undefined ? money(deliveryFee) : "A confirmar"}</b></div>
                  )}
                  <div className="order-grand-total"><span>Total do pedido</span><b>{money(orderTotal)}</b></div>
                </div>
                <small>
                  {orderMode === "entrega"
                    ? deliveryFee !== undefined ? "A taxa de entrega já está incluída no total." : "A taxa para este local será confirmada no WhatsApp."
                    : orderMode === "retirada" ? `Retirada estimada em ${storeSettings.pickupTime}.` : "Você poderá comer no estabelecimento quando o pedido ficar pronto."}
                </small>
                <button
                  className="whatsapp-order"
                  onClick={sendOrder}
                  disabled={
                    sendingOrder ||
                    !storeSettings.isOpen ||
                    !customerName.trim() ||
                    customerPhoneInvalid ||
                    (orderMode !== "local" && !paymentMethod) ||
                    cashChangeMissing ||
                    cashAmountInvalid ||
                    (orderMode === "entrega" && (!neighborhood.trim() || !street.trim()))
                  }
                >
                  {!storeSettings.isOpen ? "Hamburgueria fechada" : sendingOrder ? "Registrando pedido..." : "Enviar pedido no WhatsApp"} <span>↗</span>
                </button>
                {orderError && <p className="form-error" role="alert">{orderError}</p>}
                {(!customerName.trim() || customerPhoneInvalid || (orderMode !== "local" && !paymentMethod) || cashChangeMissing || cashAmountInvalid ||
                  (orderMode === "entrega" && (!neighborhood.trim() || !street.trim()))) && (
                  <p className="form-hint">
                    {customerPhoneInvalid
                      ? "Informe um WhatsApp v\u00e1lido com DDD."
                      : cashChangeMissing
                      ? "Escolha se precisa ou não de troco."
                      : cashAmountInvalid
                      ? `O valor para troco precisa ser igual ou maior que ${money(orderTotal)}.`
                      : `Preencha seu nome e WhatsApp${orderMode === "entrega" ? ", bairro e rua" : ""}${orderMode !== "local" ? " e selecione a forma de pagamento" : ""} para continuar.`}
                  </p>
                )}
              </div>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
