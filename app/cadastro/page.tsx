"use client";

import { useActionState } from "react";
import Link from "next/link";
import { cadastrar, type EstadoForm } from "@/app/actions/auth";
import { AuthShell } from "@/app/_components/auth-shell";

export default function CadastroPage() {
  const [estado, acao, pendente] = useActionState<EstadoForm, FormData>(
    cadastrar,
    {}
  );

  return (
    <AuthShell cadastro>
      <div className="auth-form">
        <h1>Crie sua conta</h1>
        <p className="auth-form-subtitle">Leva menos de um minuto.</p>

        <form action={acao}>
          <div className="auth-fields">
            <label className="field">
              Nome completo
              <input
                autoComplete="name"
                name="nome"
                placeholder="Seu nome"
                required
              />
            </label>
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
                autoComplete="new-password"
                name="senha"
                type="password"
                placeholder="Mínimo de 8 caracteres"
                minLength={8}
                required
              />
            </label>
            <label className="field">
              Confirmar senha
              <input
                autoComplete="new-password"
                name="confirmarSenha"
                type="password"
                placeholder="Digite a senha novamente"
                required
              />
            </label>
          </div>

          {estado.erro && (
            <p className="form-error" role="alert">{estado.erro}</p>
          )}

          <button className="primary-button" disabled={pendente} type="submit">
            {pendente ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <p className="auth-footer">
          Já tem conta? <Link href="/login">Entrar</Link>
        </p>
      </div>
    </AuthShell>
  );
}