import Link from "next/link";
import { AppShell } from "@/app/_components/app-shell";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/auth";
import FormAnimal from "./form";

export const instant = false;

export default async function NovoAnimalPage() {
  const usuario = await exigirUsuario();

  const [racoes, comedouros] = await Promise.all([
    prisma.racao.findMany({
      where: { usuarioId: usuario.id },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
    prisma.comedouro.findMany({
      where: { usuarioId: usuario.id },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
  ]);

  return (
    <AppShell nome={usuario.nome} email={usuario.email}>
      <header className="page-heading">
        <div>
          <h1>Novo animal</h1>
          <p>Cadastre seu pet e vincule a ração e o comedouro.</p>
        </div>
      </header>

      {racoes.length === 0 ? (
        <section className="surface-card empty-state">
          <p>Antes de cadastrar um animal, você precisa cadastrar uma ração.</p>
          <Link href="/racoes/nova">Cadastrar ração</Link>
        </section>
      ) : (
        <FormAnimal racoes={racoes} comedouros={comedouros} />
      )}
    </AppShell>
  );
}