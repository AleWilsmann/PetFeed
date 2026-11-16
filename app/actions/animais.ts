"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/auth";
import type { EstadoForm } from "./auth";

export async function criarAnimal(
  _estado: EstadoForm,
  formData: FormData
): Promise<EstadoForm> {
  const usuario = await exigirUsuario();

  const nome = String(formData.get("nome") ?? "").trim();
  const racaoId = String(formData.get("racaoId") ?? "");
  const comedouroId = String(formData.get("comedouroId") ?? "");

  if (nome.length < 2) return { erro: "Informe o nome do animal." };

  // Confere se a ração e o comedouro escolhidos são mesmo deste usuário
  const racao = await prisma.racao.findFirst({
    where: { id: racaoId, usuarioId: usuario.id },
  });
  if (!racao) return { erro: "Escolha uma ração válida." };

  let comedouroFinal: string | null = null;
  if (comedouroId) {
    const comedouro = await prisma.comedouro.findFirst({
      where: { id: comedouroId, usuarioId: usuario.id },
    });
    if (!comedouro) return { erro: "Escolha um comedouro válido." };
    comedouroFinal = comedouro.id;
  }

  await prisma.animal.create({
    data: {
      usuarioId: usuario.id,
      nome,
      racaoId: racao.id,
      comedouroId: comedouroFinal,
    },
  });

  revalidatePath("/animais");
  redirect("/animais");
}

export async function atualizarAnimal(
  _estado: EstadoForm,
  formData: FormData
): Promise<EstadoForm> {
  const usuario = await exigirUsuario();

  const id = String(formData.get("id") ?? "");
  const nome = String(formData.get("nome") ?? "").trim();
  const racaoId = String(formData.get("racaoId") ?? "");
  const comedouroId = String(formData.get("comedouroId") ?? "");

  if (!id) return { erro: "Animal não encontrado." };
  if (nome.length < 2) return { erro: "Informe o nome do animal." };

  const racao = await prisma.racao.findFirst({
    where: { id: racaoId, usuarioId: usuario.id },
  });
  if (!racao) return { erro: "Escolha uma ração válida." };

  let comedouroFinal: string | null = null;
  if (comedouroId) {
    const comedouro = await prisma.comedouro.findFirst({
      where: { id: comedouroId, usuarioId: usuario.id },
    });
    if (!comedouro) return { erro: "Escolha um comedouro válido." };
    comedouroFinal = comedouro.id;
  }

  const resultado = await prisma.animal.updateMany({
    where: { id, usuarioId: usuario.id },
    data: {
      nome,
      racaoId: racao.id,
      comedouroId: comedouroFinal,
    },
  });
  if (resultado.count === 0) return { erro: "Animal não encontrado." };

  revalidatePath("/animais");
  revalidatePath("/animais/[id]", "page");
  redirect("/animais");
}

export async function excluirAnimal(formData: FormData) {
  const usuario = await exigirUsuario();
  const id = String(formData.get("id"));

  await prisma.animal.deleteMany({
    where: { id, usuarioId: usuario.id },
  });

  revalidatePath("/animais");
}