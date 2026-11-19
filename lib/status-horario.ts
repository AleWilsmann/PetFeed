export type StatusDosagem = "OK" | "FALHOU" | "PARADO";

type RegistroHorario = {
  previstoEm: Date;
  status: StatusDosagem;
};

export function chaveDataBrasilia(data: Date) {
  if (Number.isNaN(data.getTime())) return "";

  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(data);
  const valor = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((parte) => parte.type === tipo)?.value ?? "";

  return `${valor("year")}-${valor("month")}-${valor("day")}`;
}

function minutosBrasilia(data: Date) {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(data);
  const valor = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((parte) => parte.type === tipo)?.value ?? "";

  return Number(valor("hour")) * 60 + Number(valor("minute"));
}

export function statusHoje(registros: RegistroHorario[], hora: string) {
  const agora = new Date();
  const hoje = chaveDataBrasilia(agora);
  const registro = registros.find((item) => {
    if (Number.isNaN(item.previstoEm.getTime())) return false;
    return chaveDataBrasilia(item.previstoEm) === hoje;
  });

  if (!registro) {
    const [horaAgendada, minutoAgendado] = hora.split(":").map(Number);
    const horarioJaChegou =
      minutosBrasilia(agora) >= horaAgendada * 60 + minutoAgendado;

    if (!horarioJaChegou) {
      return { texto: "Aguardando horário", classe: "status-pill-muted" };
    }

    return { texto: "Ração não ministrada", classe: "status-pill-danger" };
  }

  if (registro.status === "OK") {
    return { texto: "Ração ministrada", classe: "status-pill-success" };
  }

  return {
    texto: registro.status === "FALHOU"
      ? "Falha ao ministrar"
      : "Dosagem parada",
    classe: "status-pill-danger",
  };
}
