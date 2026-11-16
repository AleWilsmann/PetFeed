"use client";

import Link from "next/link";
import { useActionState } from "react";
import { atualizarRacao, criarRacao } from "@/app/actions/racoes";
import type { EstadoForm } from "@/app/actions/auth";

type RacaoFormData = {
  id: string;
  nome: string;
  densidadeGml: number;
  fatorAjuste: number;
};

export default function NovaRacaoForm({ racao }: { racao?: RacaoFormData }) {
  const [estado, acao, pendente] = useActionState<EstadoForm, FormData>(
    racao ? atualizarRacao : criarRacao,
    {},
  );

  return (
    <form action={acao} className="form-grid" key={racao?.id ?? "nova"}>
      {racao && <input type="hidden" name="id" value={racao.id} />}
      <section className="surface-card form-card">
        <h2>Dados da ração</h2>
        <label className="field">
          Nome
          <input
            name="nome"
            required
            placeholder="Ex.: Ração adulto 15 kg"
            defaultValue={racao?.nome}
          />
        </label>

        <label className="field">
          Densidade (g/mL)
          <input
            inputMode="decimal"
            name="densidade"
            placeholder="Ex.: 0,45"
            defaultValue={racao?.densidadeGml.toString().replace(".", ",")}
            required
          />
          <span className="field-help">
            Encha um copo medidor de 100 mL, pese a ração e divida o peso em
            gramas por 100.
          </span>
        </label>

        <label className="field">
          Fator de ajuste (opcional)
          <input
            inputMode="decimal"
            name="fator"
            placeholder="1"
            defaultValue={racao?.fatorAjuste.toString().replace(".", ",") ?? "1"}
          />
          <span className="field-help">
            Deixe em 1 se ainda não mediu a diferença entre a porção prevista e
            a quantidade liberada.
          </span>
        </label>
      </section>

      <aside className="surface-card form-card">
        <div className="info-panel">
          <strong>Por que informar a densidade?</strong>
          <p>
            Ela ajuda o sistema a converter o peso da porção no tempo de
            funcionamento do comedouro.
          </p>
        </div>
        {estado.erro && <p className="form-error" role="alert">{estado.erro}</p>}
        <div className="page-actions">
          <Link className="outline-link" href="/racoes">Cancelar</Link>
          <button className="primary-button" disabled={pendente} type="submit">
            {pendente ? "Salvando..." : racao ? "Salvar alterações" : "Salvar ração"}
          </button>
        </div>
      </aside>
    </form>
  );
}
