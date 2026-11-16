import { notFound } from "next/navigation";
import { AppShell } from "@/app/_components/app-shell";
import NovaRacaoForm from "@/app/racoes/nova/form";
import { exigirUsuario } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function EditarRacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = await exigirUsuario();
  const racao = await prisma.racao.findFirst({
    where: { id, usuarioId: usuario.id },
    select: { id: true, nome: true, densidadeGml: true, fatorAjuste: true },
  });
  if (!racao) notFound();

  return (
    <AppShell nome={usuario.nome} email={usuario.email}>
      <header className="page-heading">
        <div>
          <h1>Editar ração</h1>
          <p>Atualize os dados usados para calcular as porções.</p>
        </div>
      </header>
      <NovaRacaoForm racao={racao} />
    </AppShell>
  );
}
