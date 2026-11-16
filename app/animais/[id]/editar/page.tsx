import { notFound } from "next/navigation";
import { AppShell } from "@/app/_components/app-shell";
import FormAnimal from "@/app/animais/novo/form";
import { exigirUsuario } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function EditarAnimalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = await exigirUsuario();

  const [animal, racoes, comedouros] = await Promise.all([
    prisma.animal.findFirst({
      where: { id, usuarioId: usuario.id },
      select: { id: true, nome: true, racaoId: true, comedouroId: true },
    }),
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
  if (!animal) notFound();

  return (
    <AppShell nome={usuario.nome} email={usuario.email}>
      <header className="page-heading">
        <div>
          <h1>Editar animal</h1>
          <p>Atualize os dados e os equipamentos vinculados ao pet.</p>
        </div>
      </header>
      <FormAnimal animal={animal} racoes={racoes} comedouros={comedouros} />
    </AppShell>
  );
}
