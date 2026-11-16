"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { criarSessao, encerrarSessao } from "@/lib/session";

export type EstadoForm = { erro?: string };

const cadastroSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome."),
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  senha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
  confirmarSenha: z.string().min(1, "Confirme sua senha."),
}).refine((dados) => dados.senha === dados.confirmarSenha, {
  path: ["confirmarSenha"],
  message: "As senhas não coincidem.",
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  senha: z.string().min(1, "Informe a senha."),
});

export async function cadastrar(
  _estado: EstadoForm,
  formData: FormData
): Promise<EstadoForm> {
  const dados = cadastroSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    senha: formData.get("senha"),
    confirmarSenha: formData.get("confirmarSenha"),
  });
  if (!dados.success) return { erro: dados.error.issues[0].message };

  const existente = await prisma.usuario.findUnique({
    where: { email: dados.data.email },
  });
  if (existente) return { erro: "Este e-mail já está cadastrado." };

  const senhaHash = await bcrypt.hash(dados.data.senha, 12);
  const usuario = await prisma.usuario.create({
    data: { nome: dados.data.nome, email: dados.data.email, senhaHash },
  });

  await criarSessao(usuario.id);
  redirect("/painel");
}

export async function entrar(
  _estado: EstadoForm,
  formData: FormData
): Promise<EstadoForm> {
  const dados = loginSchema.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
  });
  if (!dados.success) return { erro: dados.error.issues[0].message };

  const usuario = await prisma.usuario.findUnique({
    where: { email: dados.data.email },
  });

  // Mensagem única para não revelar se o e-mail existe
  const senhaOk = usuario
    ? await bcrypt.compare(dados.data.senha, usuario.senhaHash)
    : false;
  if (!usuario || !senhaOk) return { erro: "E-mail ou senha incorretos." };

  await criarSessao(usuario.id);
  redirect("/painel");
}

export async function sair() {
  await encerrarSessao();
  redirect("/login");
}