import Link from "next/link";
import { AppShell } from "@/app/_components/app-shell";
import { Icon } from "@/app/_components/icons";
import { exigirUsuario } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { statusHoje } from "@/lib/status-horario";
import StatusRefeicao from "@/app/_components/status-refeicao";

export const instant = false;

const DIAS_CURTOS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function horarioLocalAgora() {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const parte = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((item) => item.type === tipo)?.value ?? "";

  return {
    dia: DIAS_CURTOS.indexOf(parte("weekday")),
    minutos: Number(parte("hour")) * 60 + Number(parte("minute")),
    ano: Number(parte("year")),
    mes: Number(parte("month")),
    diaDoMes: Number(parte("day")),
  };
}

function nomeDoDia(offset: number, hoje: ReturnType<typeof horarioLocalAgora>) {
  if (offset === 0) return "Hoje";
  if (offset === 1) return "Amanhã";
  const data = new Date(Date.UTC(hoje.ano, hoje.mes - 1, hoje.diaDoMes + offset, 12));
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
  }).format(data);
}

export default async function PainelPage() {
  const usuario = await exigirUsuario();
  const [animais, comedouros, totalRacoes] = await Promise.all([
    prisma.animal.findMany({
      where: { usuarioId: usuario.id },
      include: {
        comedouro: { select: { nome: true } },
        horarios: {
          where: { ativo: true },
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
    }),
    prisma.comedouro.findMany({
      where: { usuarioId: usuario.id },
      include: { animais: { select: { nome: true }, orderBy: { nome: "asc" } } },
      orderBy: { nome: "asc" },
    }),
    prisma.racao.count({ where: { usuarioId: usuario.id } }),
  ]);

  const agora = horarioLocalAgora();
  const refeicoesHoje = animais.flatMap((animal) =>
    animal.horarios
      .filter((horario) => horario.diasSemana.includes(agora.dia))
      .map((horario) => ({ animal, horario }))
      .sort((a, b) => a.horario.hora.localeCompare(b.horario.hora)),
  );
  const proximas = animais.flatMap((animal) =>
    animal.horarios.flatMap((horario) =>
      Array.from({ length: 8 }, (_, offset) => {
        const dia = (agora.dia + offset) % 7;
        const [hora, minuto] = horario.hora.split(":").map(Number);
        const minutosDoDia = hora * 60 + minuto;
        const minutosAte = offset * 1440 + minutosDoDia - agora.minutos;

        return horario.diasSemana.includes(dia) && minutosAte > 0
          ? { animal, horario, offset, minutosAte }
          : [];
      }).flat(),
    ),
  ).sort((a, b) => a.minutosAte - b.minutosAte);
  const proxima = proximas[0];

  return (
    <AppShell nome={usuario.nome} email={usuario.email}>
      <header className="page-heading">
        <div>
          <h1>Olá, {usuario.nome.split(" ")[0]}!</h1>
          <p>Veja como está a rotina dos seus pets.</p>
        </div>
        <div className="page-actions">
          <Link className="outline-link" href="/animais/novo">
            <Icon name="plus" /> Novo animal
          </Link>
          <Link className="primary-button" href="/comedouros/novo">
            <Icon name="plus" /> Novo comedouro
          </Link>
        </div>
      </header>

      <section aria-label="Resumo" className="metric-grid">
        <article className="metric-card">
          <span className="metric-label">Próxima refeição</span>
          <strong className="metric-value">
            {proxima?.horario.hora ?? "—"}
          </strong>
          <span className="metric-detail">
            {proxima
              ? `${proxima.animal.nome} · ${proxima.horario.porcaoG} g · ${nomeDoDia(proxima.offset, agora)}`
              : "Cadastre horários para acompanhar a agenda."}
          </span>
        </article>
        <article className="metric-card">
          <span className="metric-label">Refeições programadas hoje</span>
          <strong className="metric-value">{refeicoesHoje.length}</strong>
          <span className="metric-detail">
            {refeicoesHoje.length === 1
              ? "1 horário ativo na agenda"
              : "horários ativos na agenda"}
          </span>
        </article>
        <article className="metric-card">
          <span className="metric-label">Rações cadastradas</span>
          <strong className="metric-value">{totalRacoes}</strong>
          <span className="metric-detail">
            Dados reais do seu cadastro; estoque ainda não é acompanhado.
          </span>
        </article>
      </section>

      <div className="dashboard-grid">
        <section className="surface-card">
          <h2 className="section-title">Agenda de hoje</h2>
          {refeicoesHoje.length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma refeição programada para hoje.</p>
              {animais.length > 0 ? (
                <Link href={`/animais/${animais[0].id}`}>
                  Adicionar horário
                </Link>
              ) : (
                <Link href="/animais/novo">Cadastrar um pet</Link>
              )}
            </div>
          ) : (
            <div className="stack">
              {refeicoesHoje.map(({ animal, horario }) => {
                const status = statusHoje(horario.historico, horario.hora);
                return (
                <Link
                  className="meal-row"
                  href={`/animais/${animal.id}`}
                  key={horario.id}
                  style={{ textDecoration: "none" }}
                >
                  <span className="meal-time">{horario.hora}</span>
                  <span className="row-copy">
                    <strong>{animal.nome} · {horario.porcaoG} g</strong>
                    <span>{animal.comedouro?.nome ?? "Sem comedouro vinculado"}</span>
                  </span>
                  <StatusRefeicao
                    horarioId={horario.id}
                    texto={status.texto}
                    classe={status.classe}
                  />
                </Link>
                );
              })}
            </div>
          )}
        </section>

        <section className="surface-card">
          <div className="section-heading-row">
            <h2 className="section-title">Comedouros</h2>
            <Link className="text-link" href="/comedouros">Ver todos</Link>
          </div>
          {comedouros.length === 0 ? (
            <div className="empty-state">
              <p>Cadastre um comedouro para vinculá-lo aos seus pets.</p>
              <Link href="/comedouros/novo">Adicionar comedouro</Link>
            </div>
          ) : (
            <div className="stack">
              {comedouros.slice(0, 3).map((comedouro) => (
                <div className="device-row" key={comedouro.id}>
                  <span className="device-icon"><Icon name="bowl" /></span>
                  <span className="row-copy">
                    <strong>{comedouro.nome}</strong>
                    <span>
                      {comedouro.animais.length > 0
                        ? comedouro.animais.map((animal) => animal.nome).join(", ")
                        : "Nenhum pet vinculado"}
                    </span>
                  </span>
                  <span className="status-pill">Cadastrado</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
