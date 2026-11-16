import { prisma } from "./prisma";

// Lê o cabeçalho "Authorization: Bearer <token>" e devolve o comedouro dono do token
export async function autenticarDispositivo(request: Request) {
  const cabecalho = request.headers.get("authorization") ?? "";
  const [tipo, token] = cabecalho.split(" ");

  if (tipo !== "Bearer" || !token) return null;

  return prisma.comedouro.findUnique({ where: { token } });
}