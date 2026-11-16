"use client";

import { useActionState } from "react";
import Link from "next/link";
import { entrar, type EstadoForm } from "@/app/actions/auth";
import { AuthShell } from "@/app/_components/auth-shell";

export default function LoginPage() {
  const [estado, acao, pendente] = useActionState<EstadoForm, FormData>(
    entrar,
    {}
  );

  return (
    <AuthShell>
      <div className="auth-form">
        <h1>Olá de novo!</h1>
        <p className="auth-form-subtitle">Entre para acompanhar seus pets.</p>

        <form action={acao}>
          <div className="auth-fields">
            <label className="field">
              E-mail
              <input
                autoComplete="email"
                name="email"
                type="email"
                placeholder="voce@email.com"
                required
              />
            </label>
            <label className="field">
              Senha
              <input
                autoComplete="current-password"
                name="senha"
                type="password"
                placeholder="Sua senha"
                required
              />
            </label>
          </div>

          {estado.erro && (
            <p className="form-error" role="alert">{estado.erro}</p>
          )}

          <button className="primary-button" disabled={pendente} type="submit">
            {pendente ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="auth-footer">
          Não tem conta? <Link href="/cadastro">Cadastre-se</Link>
        </p>
      </div>
    </AuthShell>
  );
}