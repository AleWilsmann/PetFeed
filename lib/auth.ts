import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { lerSessao } from "./session";

export async function exigirUsuario() {
  const sessao = await lerSessao();
  if (!sessao) redirect("/login");

  const usuario = await prisma.usuario.findUnique({
    where: { id: sessao.usuarioId },
    select: { id: true, nome: true, email: true },
  });
  if (!usuario) redirect("/login");

  return usuario;
}