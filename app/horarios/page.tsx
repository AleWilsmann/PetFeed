import Link from "next/link";
import { AppShell } from "@/app/_components/app-shell";
import { Icon } from "@/app/_components/icons";
import { exigirUsuario } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { statusHoje } from "@/lib/status-horario";
import StatusRefeicao from "@/app/_components/status-refeicao";

export const instant = false;

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function nomeDosDias(dias: number[]) {
  return dias.length === 7
    ? "Todos os dias"
    : dias.map((dia) => DIAS[dia]).join(", ");
}

export default async function HorariosPage() {
  const usuario = await exigirUsuario();
  const animais = await prisma.animal.findMany({
    where: { usuarioId: usuario.id },
    include: {
      comedouro: { select: { nome: true } },
      horarios: {
        orderBy: { hora: "asc" },
        include: {
          historico: {
            orderBy: { previstoEm: "desc" },
            take: 20,
            select: { previstoEm: true, status: true },
          },
        },
      },
    },
    orderBy: { nome: "asc" },
  });
  const horarios = animais
    .flatMap((animal) =>
      animal.horarios.map((horario) => ({ animal, horario })),
    )
    .sort((a, b) => a.horario.hora.localeCompare(b.horario.hora));

  return (
    <AppShell nome={usuario.nome} email={usuario.email}>
      <header className="page-heading">
        <div>
          <h1>Horários</h1>
          <p>Veja a programação de refeições dos seus pets.</p>
        </div>
      </header>

      {horarios.length === 0 ? (
        <section className="surface-card empty-state">
          <p>Você ainda não programou nenhum horário.</p>
          {animais.length > 0 ? (
            <Link href={`/animais/${animais[0].id}`}>Programar uma refeição</Link>
          ) : (
            <Link href="/animais/novo">Cadastrar um pet</Link>
          )}
        </section>
      ) : (
        <section className="surface-card">
          <h2 className="section-title">Programação cadastrada</h2>
          <ul className="stack card-list">
            {horarios.map(({ animal, horario }) => {
              const status = statusHoje(horario.historico, horario.hora);
              return (
              <li className={`meal-row${horario.ativo ? "" : " is-disabled"}`} key={horario.id}>
                <span className="meal-time">{horario.hora}</span>
                <span className="row-copy">
                  <strong>{animal.nome} · {horario.porcaoG} g</strong>
                  <span>{nomeDosDias(horario.diasSemana)}</span>
                  <span>{animal.comedouro?.nome ?? "Sem comedouro vinculado"}</span>
                </span>
                <div className="schedule-statuses">
                  <span className={`status-pill${horario.ativo ? "" : " status-pill-muted"}`}>
                    {horario.ativo ? "Ativo" : "Inativo"}
                  </span>
                  <StatusRefeicao
                    horarioId={horario.id}
                    texto={status.texto}
                    classe={status.classe}
                  />
                </div>
                <Link
                  aria-label={`Gerenciar horários de ${animal.nome}`}
                  className="schedule-manage-link"
                  href={`/animais/${animal.id}`}
                >
                  <Icon name="arrow" />
                </Link>
              </li>
              );
            })}
          </ul>
        </section>
      )}
    </AppShell>
  );
}
