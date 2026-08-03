import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const incoming = await headers();
  const host = incoming.get("x-forwarded-host") ?? incoming.get("host") ?? "localhost:3000";
  const protocol = incoming.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);

  return {
    metadataBase,
    title: "Ponto Z Hamburgueria | Cardápio Digital",
    description: "Peça seu lanche favorito da Ponto Z pelo WhatsApp. Delivery e retirada em Lavras/MG.",
    openGraph: {
      title: "Ponto Z | Cardápio Digital",
      description: "Escolha seu lanche e envie o pedido direto para o WhatsApp.",
      type: "website",
      locale: "pt_BR",
      images: [{ url: "/og.png", width: 1734, height: 907, alt: "Ponto Z - Cardápio Digital" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Ponto Z | Cardápio Digital",
      description: "Escolha seu lanche e envie o pedido direto para o WhatsApp.",
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head><meta name="color-scheme" content="light" /></head>
      <body>{children}</body>
    </html>
  );
}
