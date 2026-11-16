"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/auth";
import type { EstadoForm } from "./auth";

const comedouroSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do comedouro."),
  vazao: z
    .number()
    .min(0.1, "A vazão deve ficar entre 0,1 e 100 mL/s.")
    .max(100, "A vazão deve ficar entre 0,1 e 100 mL/s."),
  tempoMaximo: z
    .number()
    .int("Use um número inteiro de segundos.")
    .min(1, "O tempo máximo deve ficar entre 1 e 60 segundos.")
    .max(60, "O tempo máximo deve ficar entre 1 e 60 segundos."),
});

function paraNumero(valor: FormDataEntryValue | null, padrao: number) {
  const texto = String(valor ?? "").trim().replace(",", ".");
  if (texto === "") return padrao;
  return Number(texto);
}

export async function criarComedouro(
  _estado: EstadoForm,
  formData: FormData
): Promise<EstadoForm> {
  const usuario = await exigirUsuario();

  const vazao = paraNumero(formData.get("vazao"), NaN);
  const tempoMaximo = paraNumero(formData.get("tempoMaximo"), 15);
  if (!Number.isFinite(vazao) || !Number.isFinite(tempoMaximo)) {
    return { erro: "Use apenas números na vazão e no tempo máximo." };
  }

  const dados = comedouroSchema.safeParse({
    nome: formData.get("nome"),
    vazao,
    tempoMaximo,
  });
  if (!dados.success) return { erro: dados.error.issues[0].message };

  await prisma.comedouro.create({
    data: {
      usuarioId: usuario.id,
      nome: dados.data.nome,
      vazaoMlPorS: dados.data.vazao,
      tempoMaximoS: dados.data.tempoMaximo,
    },
  });

  revalidatePath("/comedouros");
  redirect("/comedouros");
}

export async function atualizarComedouro(
  _estado: EstadoForm,
  formData: FormData
): Promise<EstadoForm> {
  const usuario = await exigirUsuario();
  const id = String(formData.get("id") ?? "");

  if (!id) return { erro: "Comedouro não encontrado." };

  const vazao = paraNumero(formData.get("vazao"), NaN);
  const tempoMaximo = paraNumero(formData.get("tempoMaximo"), 15);
  if (!Number.isFinite(vazao) || !Number.isFinite(tempoMaximo)) {
    return { erro: "Use apenas números na vazão e no tempo máximo." };
  }

  const dados = comedouroSchema.safeParse({
    nome: formData.get("nome"),
    vazao,
    tempoMaximo,
  });
  if (!dados.success) return { erro: dados.error.issues[0].message };

  const resultado = await prisma.comedouro.updateMany({
    where: { id, usuarioId: usuario.id },
    data: {
      nome: dados.data.nome,
      vazaoMlPorS: dados.data.vazao,
      tempoMaximoS: dados.data.tempoMaximo,
    },
  });
  if (resultado.count === 0) return { erro: "Comedouro não encontrado." };

  revalidatePath("/comedouros");
  revalidatePath("/animais");
  revalidatePath("/animais/[id]", "page");
  redirect("/comedouros");
}

export async function excluirComedouro(formData: FormData) {
  const usuario = await exigirUsuario();
  const id = String(formData.get("id"));

  await prisma.comedouro.deleteMany({
    where: { id, usuarioId: usuario.id },
  });

  revalidatePath("/comedouros");
}