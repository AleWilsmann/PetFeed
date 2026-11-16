import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/auth";
import { excluirRacao } from "@/app/actions/racoes";
import { AppShell } from "@/app/_components/app-shell";
import { Icon } from "@/app/_components/icons";

export const instant = false;

export default async function RacoesPage() {
  const usuario = await exigirUsuario();

  const racoes = await prisma.racao.findMany({
    where: { usuarioId: usuario.id },
    orderBy: { nome: "asc" },
  });

  return (
    <AppShell nome={usuario.nome} email={usuario.email}>
      <header className="page-heading">
        <div>
          <h1>Minhas rações</h1>
          <p>Cadastre densidade e ajuste para calcular as porções.</p>
        </div>
        <Link href="/racoes/nova" className="primary-button">
          <Icon name="plus" /> Nova ração
        </Link>
      </header>

      {racoes.length === 0 ? (
        <section className="surface-card empty-state">
          <p>Nenhuma ração cadastrada ainda.</p>
          <Link href="/racoes/nova">Cadastrar ração</Link>
        </section>
      ) : (
        <ul className="stack card-list">
          {racoes.map((racao) => (
            <li className="surface-card list-row" key={racao.id}>
              <span className="device-icon"><Icon name="food" /></span>
              <div className="row-copy">
                <strong>{racao.nome}</strong>
                <span>
                  Densidade: {racao.densidadeGml.toString().replace(".", ",")} g/mL
                  {racao.fatorAjuste !== 1 && ` · Ajuste: ×${racao.fatorAjuste}`}
                </span>
              </div>
              <div className="row-actions">
                <Link href={`/racoes/${racao.id}/editar`} className="outline-link">Editar</Link>
                <form action={excluirRacao}>
                  <input type="hidden" name="id" value={racao.id} />
                  <button type="submit" className="danger-button">Excluir</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}