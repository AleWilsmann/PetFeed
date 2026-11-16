import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PetFeed",
  description: "Cuide da rotina de alimentação do seu pet",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}