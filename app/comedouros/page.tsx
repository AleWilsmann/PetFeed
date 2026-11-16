import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/auth";
import { excluirComedouro } from "@/app/actions/comedouros";
import { AppShell } from "@/app/_components/app-shell";
import { Icon } from "@/app/_components/icons";

export const instant = false;

export default async function ComedourosPage() {
  const usuario = await exigirUsuario();

  const comedouros = await prisma.comedouro.findMany({
    where: { usuarioId: usuario.id },
    include: { animais: { select: { nome: true }, orderBy: { nome: "asc" } } },
    orderBy: { nome: "asc" },
  });

  return (
    <AppShell nome={usuario.nome} email={usuario.email}>
      <header className="page-heading">
        <div>
          <h1>Meus comedouros</h1>
          <p>Gerencie seus dispositivos e veja os pets vinculados.</p>
        </div>
        <Link href="/comedouros/novo" className="primary-button">
          <Icon name="plus" /> Novo comedouro
        </Link>
      </header>

      {comedouros.length === 0 ? (
        <section className="surface-card empty-state">
          <p>Nenhum comedouro cadastrado ainda.</p>
          <Link href="/comedouros/novo">Cadastrar comedouro</Link>
        </section>
      ) : (
        <ul className="stack card-list">
          {comedouros.map((comedouro) => (
            <li className="surface-card feeder-list-card" key={comedouro.id}>
              <div className="list-row feeder-list-heading">
                <span className="device-icon"><Icon name="bowl" /></span>
                <div className="row-copy">
                  <strong>{comedouro.nome}</strong>
                  <span>
                    Vazão: {comedouro.vazaoMlPorS.toString().replace(".", ",")} mL/s ·
                    {" "}máximo: {comedouro.tempoMaximoS} s
                  </span>
                </div>
                <div className="row-actions">
                  <Link href={`/comedouros/${comedouro.id}/editar`} className="outline-link">Editar</Link>
                  <form action={excluirComedouro}>
                    <input type="hidden" name="id" value={comedouro.id} />
                    <button type="submit" className="danger-button">Excluir</button>
                  </form>
                </div>
              </div>
              <p className="muted-copy">
                Pets vinculados: {comedouro.animais.map((animal) => animal.nome).join(", ") || "nenhum"}
              </p>
              <details className="token-details">
                <summary>Token do dispositivo (não compartilhe)</summary>
                <code className="token-code">{comedouro.token}</code>
              </details>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}