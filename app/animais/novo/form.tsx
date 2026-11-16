"use client";

import { useActionState } from "react";
import { atualizarAnimal, criarAnimal } from "@/app/actions/animais";
import type { EstadoForm } from "@/app/actions/auth";
import Link from "next/link";
import { Icon } from "@/app/_components/icons";

type Opcao = { id: string; nome: string };
type AnimalFormData = {
  id: string;
  nome: string;
  racaoId: string;
  comedouroId: string | null;
};

export default function FormAnimal({
  racoes,
  comedouros,
  animal,
}: {
  racoes: Opcao[];
  comedouros: Opcao[];
  animal?: AnimalFormData;
}) {
  const [estado, acao, pendente] = useActionState<EstadoForm, FormData>(
    animal ? atualizarAnimal : criarAnimal,
    {}
  );

  return (
    <form action={acao} key={animal?.id ?? "novo"}>
      {animal && <input type="hidden" name="id" value={animal.id} />}
      <div className="form-grid">
        <section className="surface-card form-card">
          <h2>Dados do pet</h2>
          <div className="pet-avatar">
            <Icon name="paw" />
          </div>

          <label className="field">
            Nome do pet
            <input
              autoComplete="off"
              name="nome"
              placeholder="Ex.: Thor"
              defaultValue={animal?.nome}
              required
            />
          </label>

          <label className="field">
            Ração
            <select name="racaoId" defaultValue={animal?.racaoId} required>
              {racoes.map((racao) => (
                <option key={racao.id} value={racao.id}>{racao.nome}</option>
              ))}
            </select>
          </label>
          <p className="field-help">
            A ração selecionada será usada no cálculo das porções programadas.
          </p>
        </section>

        <section className="surface-card form-card">
          <h2>Comedouro vinculado</h2>
          <label className="field">
            Selecione um comedouro
            <select name="comedouroId" defaultValue={animal?.comedouroId ?? ""}>
              <option value="">Nenhum por enquanto</option>
              {comedouros.map((comedouro) => (
                <option key={comedouro.id} value={comedouro.id}>
                  {comedouro.nome}
                </option>
              ))}
            </select>
          </label>
          {comedouros.length === 0 ? (
            <div className="info-panel">
              <strong>Você ainda não cadastrou um comedouro.</strong>
              <p>
                <Link className="text-link" href="/comedouros/novo">
                  Cadastre um comedouro
                </Link>{" "}
                para vinculá-lo ao pet.
              </p>
            </div>
          ) : (
            <div className="info-panel">
              <strong>Próximo passo: programar os horários</strong>
              <p>Depois de salvar, abra o perfil do pet para criar a agenda de refeições.</p>
            </div>
          )}
          <div className="schedule-preview">
            <span className="schedule-preview-icon"><Icon name="clock" /></span>
            <span>
              <strong>Horários de refeição</strong>
              <small>Disponíveis após cadastrar o pet</small>
            </span>
          </div>
        </section>
      </div>

      {estado.erro && <p className="form-error" role="alert">{estado.erro}</p>}
      <div className="page-actions">
        <Link className="outline-link" href={animal ? `/animais/${animal.id}` : "/animais"}>Cancelar</Link>
        <button className="primary-button" disabled={pendente} type="submit">
          {pendente ? "Salvando..." : animal ? "Salvar alterações" : "Salvar animal"}
        </button>
      </div>
    </form>
  );
}