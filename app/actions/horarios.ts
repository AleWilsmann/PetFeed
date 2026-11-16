"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/auth";
import type { EstadoForm } from "./auth";

export async function criarHorario(
  _estado: EstadoForm,
  formData: FormData
): Promise<EstadoForm> {
  const usuario = await exigirUsuario();

  const animalId = String(formData.get("animalId") ?? "");
  const hora = String(formData.get("hora") ?? "");
  const porcao = Number(String(formData.get("porcao") ?? "").trim().replace(",", "."));
  const dias = [...new Set(
    formData
      .getAll("dias")
      .map((d) => Number(d))
      .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6),
  )].sort((a, b) => a - b);

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)) {
    return { erro: "Informe uma hora válida." };
  }
  if (!Number.isFinite(porcao) || porcao < 1 || porcao > 1000) {
    return { erro: "A porção deve ficar entre 1 e 1000 gramas." };
  }
  if (dias.length === 0) {
    return { erro: "Marque pelo menos um dia da semana." };
  }

  // Confere se o animal é deste usuário
  const animal = await prisma.animal.findFirst({
    where: { id: animalId, usuarioId: usuario.id },
  });
  if (!animal) return { erro: "Animal não encontrado." };

  const chaveDuplicidade = JSON.stringify([animal.id, hora, porcao, dias]);
  const criado = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`
      SELECT 1
      FROM (
        SELECT pg_advisory_xact_lock(hashtextextended(${chaveDuplicidade}, 0))
      ) AS trava
    `;

    const existente = await tx.horario.findFirst({
      where: {
        animalId: animal.id,
        hora,
        porcaoG: porcao,
        diasSemana: { equals: dias },
      },
      select: { id: true },
    });
    if (existente) return false;

    await tx.horario.create({
      data: {
        animalId: animal.id,
        hora,
        porcaoG: porcao,
        diasSemana: dias,
      },
    });
    return true;
  });

  if (!criado) {
    return { erro: "Esse horário já está cadastrado para os mesmos dias e porção." };
  }

  revalidatePath(`/animais/${animal.id}`);
  return {};
}

export async function alternarHorario(formData: FormData) {
  const usuario = await exigirUsuario();
  const id = String(formData.get("id"));

  const horario = await prisma.horario.findFirst({
    where: { id, animal: { usuarioId: usuario.id } },
  });
  if (!horario) return;

  await prisma.horario.update({
    where: { id: horario.id },
    data: { ativo: !horario.ativo },
  });
  revalidatePath(`/animais/${horario.animalId}`);
}

export async function excluirHorario(formData: FormData) {
  const usuario = await exigirUsuario();
  const id = String(formData.get("id"));

  const horario = await prisma.horario.findFirst({
    where: { id, animal: { usuarioId: usuario.id } },
  });
  if (!horario) return;

  await prisma.horario.delete({ where: { id: horario.id } });
  revalidatePath(`/animais/${horario.animalId}`);
}