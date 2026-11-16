import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { autenticarDispositivo } from "@/lib/dispositivo";

const registroSchema = z.object({
  horarioId: z.string().min(1),
  previstoEm: z.number().int().positive(),            // segundos desde 1970
  iniciadoEm: z.number().int().positive().optional(), // segundos desde 1970
  duracaoMs: z.number().int().min(0).max(600000).optional(),
  status: z.enum(["OK", "FALHOU", "PARADO"]),
});

export async function POST(request: Request) {
  const comedouro = await autenticarDispositivo(request);
  if (!comedouro) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  let corpo: unknown;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido." }, { status: 400 });
  }

  const dados = registroSchema.safeParse(corpo);
  if (!dados.success) {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }

  const { horarioId, previstoEm, iniciadoEm, duracaoMs, status } = dados.data;

  // O horário precisa pertencer a um animal deste comedouro
  const horario = await prisma.horario.findFirst({
    where: { id: horarioId, animal: { comedouroId: comedouro.id } },
  });
  if (!horario) {
    return NextResponse.json({ erro: "Horário não encontrado." }, { status: 404 });
  }

  await prisma.historico.create({
    data: {
      horarioId: horario.id,
      comedouroId: comedouro.id,
      previstoEm: new Date(previstoEm * 1000),
      iniciadoEm: iniciadoEm ? new Date(iniciadoEm * 1000) : null,
      duracaoMs: duracaoMs ?? null,
      status,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}