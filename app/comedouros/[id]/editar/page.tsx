import { notFound } from "next/navigation";
import { AppShell } from "@/app/_components/app-shell";
import NovoComedouroForm from "@/app/comedouros/novo/form";
import { exigirUsuario } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function EditarComedouroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = await exigirUsuario();
  const comedouro = await prisma.comedouro.findFirst({
    where: { id, usuarioId: usuario.id },
    select: { id: true, nome: true, vazaoMlPorS: true, tempoMaximoS: true },
  });
  if (!comedouro) notFound();

  return (
    <AppShell nome={usuario.nome} email={usuario.email}>
      <header className="page-heading">
        <div>
          <h1>Editar comedouro</h1>
          <p>Atualize o nome e os parâmetros de dosagem do dispositivo.</p>
        </div>
      </header>
      <NovoComedouroForm comedouro={comedouro} />
    </AppShell>
  );
}
