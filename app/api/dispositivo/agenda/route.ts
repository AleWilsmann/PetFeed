import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { autenticarDispositivo } from "@/lib/dispositivo";
import { calcularTempo } from "@/lib/calculo";


export async function GET(request: Request) {
  const comedouro = await autenticarDispositivo(request);
  if (!comedouro) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const animais = await prisma.animal.findMany({
    where: { comedouroId: comedouro.id },
    include: {
      racao: true,
      horarios: { where: { ativo: true } },
    },
  });

  const horarios = animais
    .flatMap((animal) =>
      animal.horarios.map((h) => {
        const { tempoMs } = calcularTempo({
          porcaoG: h.porcaoG,
          densidadeGml: animal.racao.densidadeGml,
          fatorAjuste: animal.racao.fatorAjuste,
          vazaoMlPorS: comedouro.vazaoMlPorS,
          tempoMaximoS: comedouro.tempoMaximoS,
        });
        return { id: h.id, hora: h.hora, dias: h.diasSemana, duracaoMs: tempoMs };
      })
    )
    .filter((h) => h.duracaoMs > 0);

  return NextResponse.json({
    fuso: "<-03>3", // Brasília (UTC-3), no formato que o ESP32 entende
    tempoMaximoMs: comedouro.tempoMaximoS * 1000,
    horarios,
  });
}