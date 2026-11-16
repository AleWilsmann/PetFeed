import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/auth";
import { excluirAnimal } from "@/app/actions/animais";
import { AppShell } from "@/app/_components/app-shell";
import { Icon } from "@/app/_components/icons";

export const instant = false;

export default async function AnimaisPage() {
    const usuario = await exigirUsuario();

    const animais = await prisma.animal.findMany({
        where: { usuarioId: usuario.id },
        include: { racao: true, comedouro: true },
        orderBy: { nome: "asc" },
    });

    return (
        <AppShell nome={usuario.nome} email={usuario.email}>
            <header className="page-heading">
                <div>
                    <h1>Meus animais</h1>
                    <p>Acompanhe os pets e suas rotinas de alimentação.</p>
                </div>
                <Link href="/animais/novo" className="primary-button">
                    <Icon name="plus" /> Novo animal
                </Link>
            </header>

            {animais.length === 0 ? (
                <section className="surface-card empty-state">
                    <p>Nenhum animal cadastrado ainda.</p>
                    <Link href="/animais/novo">Cadastrar primeiro animal</Link>
                </section>
            ) : (
                <ul className="stack card-list">
                    {animais.map((animal) => (
                        <li className="surface-card list-row" key={animal.id}>
                            <span className="pet-list-icon"><Icon name="paw" /></span>
                            <div className="row-copy">
                                <Link href={`/animais/${animal.id}`} className="row-link">
                                    {animal.nome}
                                </Link>
                                <span>
                                    Ração: {animal.racao.nome} · Comedouro: {animal.comedouro?.nome ?? "nenhum"}
                                </span>
                            </div>
                            <div className="row-actions">
                                <Link href={`/animais/${animal.id}/editar`} className="outline-link">Editar</Link>
                                <form action={excluirAnimal}>
                                    <input type="hidden" name="id" value={animal.id} />
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