import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/auth";
import { statusHoje } from "@/lib/status-horario";

export async function GET(request: Request) {
  const usuario = await exigirUsuario();
  const horarioId = new URL(request.url).searchParams.get("horarioId");

  if (!horarioId) {
    return NextResponse.json({ erro: "Horário não informado." }, { status: 400 });
  }

  const horario = await prisma.horario.findFirst({
    where: { id: horarioId, animal: { usuarioId: usuario.id } },
    select: {
      hora: true,
      historico: {
        orderBy: { previstoEm: "desc" },
        take: 20,
        select: { previstoEm: true, status: true },
      },
    },
  });

  if (!horario) {
    return NextResponse.json({ erro: "Horário não encontrado." }, { status: 404 });
  }

  return NextResponse.json(statusHoje(horario.historico, horario.hora), {
    headers: { "Cache-Control": "no-store" },
  });
}
