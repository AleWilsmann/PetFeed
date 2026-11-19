import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/auth";
import { calcularTempo } from "@/lib/calculo";
import { alternarHorario, excluirHorario } from "@/app/actions/horarios";
import FormHorario from "./form-horario";
import { AppShell } from "@/app/_components/app-shell";
import StatusRefeicao from "@/app/_components/status-refeicao";
import { statusHoje } from "@/lib/status-horario";

export const instant = false;

const NOMES_DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function formatarDias(dias: number[]) {
  if (dias.length === 7) return "Todos os dias";
  return dias.map((d) => NOMES_DIAS[d]).join(", ");
}

function formatarSegundos(ms: number) {
  return (ms / 1000).toFixed(1).replace(".", ",") + " s";
}

export default async function AnimalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = await exigirUsuario();

  const animal = await prisma.animal.findFirst({
    where: { id, usuarioId: usuario.id },
    include: {
      racao: true,
      comedouro: true,
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
  });
  if (!animal) notFound();

  return (
    <AppShell nome={usuario.nome} email={usuario.email}>
      <header className="page-heading">
        <div>
          <h1>{animal.nome}</h1>
          <p>
            Ração: {animal.racao.nome} ({animal.racao.densidadeGml.toString().replace(".", ",")} g/mL)
            {" · "}Comedouro: {animal.comedouro?.nome ?? "nenhum"}
          </p>
        </div>
        <div className="row-actions">
          <Link className="outline-link" href={`/animais/${animal.id}/editar`}>Editar</Link>
          <Link className="outline-link" href="/animais">Voltar aos animais</Link>
        </div>
      </header>

      <section className="surface-card schedule-card">
        <h2 className="section-title">Horários de refeição</h2>
        {!animal.comedouro && (
          <p className="info-panel schedule-warning">
            Este animal ainda não tem comedouro vinculado; o tempo de dosagem
            não pode ser calculado.
          </p>
        )}

        {animal.horarios.length === 0 ? (
          <div className="empty-state">Nenhum horário cadastrado ainda.</div>
        ) : (
          <ul className="stack card-list">
            {animal.horarios.map((horario) => {
              const status = statusHoje(horario.historico, horario.hora);
              const calculo = animal.comedouro
                ? calcularTempo({
                    porcaoG: horario.porcaoG,
                    densidadeGml: animal.racao.densidadeGml,
                    fatorAjuste: animal.racao.fatorAjuste,
                    vazaoMlPorS: animal.comedouro.vazaoMlPorS,
                    tempoMaximoS: animal.comedouro.tempoMaximoS,
                  })
                : null;

              return (
                <li
                  className={`meal-row${horario.ativo ? "" : " is-disabled"}`}
                  key={horario.id}
                >
                  <span className="meal-time">{horario.hora}</span>
                  <span className="row-copy">
                    <strong>{horario.porcaoG.toString().replace(".", ",")} g</strong>
                    <span>{formatarDias(horario.diasSemana)}</span>
                    {calculo && (
                      <span>
                        Motor ligado por {formatarSegundos(calculo.tempoMs)}
                      </span>
                    )}
                    {calculo?.limitado && (
                      <span className="schedule-warning-text">
                        A porção será menor devido ao limite do comedouro.
                      </span>
                    )}
                  </span>
                  <StatusRefeicao
                    horarioId={horario.id}
                    texto={status.texto}
                    classe={status.classe}
                  />
                  <div className="schedule-actions">
                    <form action={alternarHorario}>
                      <input type="hidden" name="id" value={horario.id} />
                      <button className="text-link" type="submit">
                        {horario.ativo ? "Desativar" : "Ativar"}
                      </button>
                    </form>
                    <form action={excluirHorario}>
                      <input type="hidden" name="id" value={horario.id} />
                      <button className="danger-text" type="submit">Excluir</button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="surface-card form-card new-schedule-card">
        <h2>Novo horário</h2>
        <FormHorario animalId={animal.id} />
      </section>
    </AppShell>
  );
}