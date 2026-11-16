import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const chave = new TextEncoder().encode(process.env.SESSION_SECRET);
const NOME_COOKIE = "sessao";
const SETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;

export async function criarSessao(usuarioId: string) {
  const token = await new SignJWT({ usuarioId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(chave);

  const cookieStore = await cookies();
  cookieStore.set(NOME_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(Date.now() + SETE_DIAS_MS),
    path: "/",
  });
}

export async function lerSessao(): Promise<{ usuarioId: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(NOME_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, chave, { algorithms: ["HS256"] });
    return { usuarioId: payload.usuarioId as string };
  } catch {
    return null;
  }
}

export async function encerrarSessao() {
  const cookieStore = await cookies();
  cookieStore.delete(NOME_COOKIE);
}