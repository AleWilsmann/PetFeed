"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/auth";
import type { EstadoForm } from "./auth";

const racaoSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome da ração."),
  densidade: z
    .number()
    .min(0.1, "A densidade parece baixa demais (mínimo 0,1 g/mL).")
    .max(2, "A densidade parece alta demais (máximo 2 g/mL)."),
  fator: z
    .number()
    .min(0.5, "O fator de ajuste deve ficar entre 0,5 e 2.")
    .max(2, "O fator de ajuste deve ficar entre 0,5 e 2."),
});

// Aceita vírgula ou ponto: "0,45" e "0.45"
function paraNumero(valor: FormDataEntryValue | null, padrao: number) {
  const texto = String(valor ?? "").trim().replace(",", ".");
  if (texto === "") return padrao;
  return Number(texto);
}

export async function criarRacao(
  _estado: EstadoForm,
  formData: FormData
): Promise<EstadoForm> {
  const usuario = await exigirUsuario();

  const densidade = paraNumero(formData.get("densidade"), NaN);
  const fator = paraNumero(formData.get("fator"), 1);
  if (!Number.isFinite(densidade) || !Number.isFinite(fator)) {
    return { erro: "Use apenas números na densidade e no fator." };
  }

  const dados = racaoSchema.safeParse({
    nome: formData.get("nome"),
    densidade,
    fator,
  });
  if (!dados.success) return { erro: dados.error.issues[0].message };

  await prisma.racao.create({
    data: {
      usuarioId: usuario.id,
      nome: dados.data.nome,
      densidadeGml: dados.data.densidade,
      fatorAjuste: dados.data.fator,
    },
  });

  revalidatePath("/racoes");
  redirect("/racoes");
}

export async function atualizarRacao(
  _estado: EstadoForm,
  formData: FormData
): Promise<EstadoForm> {
  const usuario = await exigirUsuario();
  const id = String(formData.get("id") ?? "");

  if (!id) return { erro: "Ração não encontrada." };

  const densidade = paraNumero(formData.get("densidade"), NaN);
  const fator = paraNumero(formData.get("fator"), 1);
  if (!Number.isFinite(densidade) || !Number.isFinite(fator)) {
    return { erro: "Use apenas números na densidade e no fator." };
  }

  const dados = racaoSchema.safeParse({
    nome: formData.get("nome"),
    densidade,
    fator,
  });
  if (!dados.success) return { erro: dados.error.issues[0].message };

  const resultado = await prisma.racao.updateMany({
    where: { id, usuarioId: usuario.id },
    data: {
      nome: dados.data.nome,
      densidadeGml: dados.data.densidade,
      fatorAjuste: dados.data.fator,
    },
  });
  if (resultado.count === 0) return { erro: "Ração não encontrada." };

  revalidatePath("/racoes");
  revalidatePath("/animais");
  revalidatePath("/animais/[id]", "page");
  redirect("/racoes");
}

export async function excluirRacao(formData: FormData) {
  const usuario = await exigirUsuario();
  const id = String(formData.get("id"));

  // Só apaga se for do próprio usuário e se nenhum animal usar essa ração
  await prisma.racao.deleteMany({
    where: { id, usuarioId: usuario.id, animais: { none: {} } },
  });

  revalidatePath("/racoes");
}