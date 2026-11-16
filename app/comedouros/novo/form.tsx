"use client";

import Link from "next/link";
import { useActionState } from "react";
import { atualizarComedouro, criarComedouro } from "@/app/actions/comedouros";
import type { EstadoForm } from "@/app/actions/auth";
import { Icon } from "@/app/_components/icons";

type ComedouroFormData = {
  id: string;
  nome: string;
  vazaoMlPorS: number;
  tempoMaximoS: number;
};

export default function NovoComedouroForm({
  comedouro,
}: {
  comedouro?: ComedouroFormData;
}) {
  const [estado, acao, pendente] = useActionState<EstadoForm, FormData>(
    comedouro ? atualizarComedouro : criarComedouro,
    {},
  );

  return (
    <form action={acao} key={comedouro?.id ?? "novo"}>
      {comedouro && <input type="hidden" name="id" value={comedouro.id} />}
      <div className="form-grid feeder-form-grid">
        <section className="surface-card form-card">
          <h2>Dados do dispositivo</h2>
          <label className="field">
            Nome do comedouro
            <input
              name="nome"
              required
              placeholder="Ex.: Comedouro da cozinha"
              defaultValue={comedouro?.nome}
            />
          </label>

          <label className="field">
            Vazão (mL por segundo)
            <input
              inputMode="decimal"
              name="vazao"
              placeholder="Ex.: 12"
              defaultValue={comedouro?.vazaoMlPorS.toString().replace(".", ",")}
              required
            />
            <span className="field-help">
              Meça quanto o mecanismo libera em 10 segundos e divida por 10.
              Você pode usar um valor provisório e corrigir depois.
            </span>
          </label>

          <label className="field">
            Tempo máximo por dosagem (segundos)
            <input
              inputMode="numeric"
              name="tempoMaximo"
              placeholder="15"
              defaultValue={comedouro?.tempoMaximoS ?? 15}
            />
            <span className="field-help">
              Trava de segurança: o motor não fica ligado por mais que esse tempo.
            </span>
          </label>
        </section>

        <section className="surface-card form-card">
          <div className="device-preview">
            <div className="device-preview-icon"><Icon name="device" /></div>
            <span>Dispositivo será identificado após salvar</span>
          </div>
          <div className="info-panel">
            <strong>Token de acesso gerado automaticamente</strong>
            <p>
              Após cadastrar o comedouro, o token do dispositivo estará disponível
              na lista de comedouros para configurar seu equipamento.
            </p>
          </div>
          <div className="info-panel feeder-pet-note">
            <strong>Pets vinculados</strong>
            <p>Você poderá associar um pet ao comedouro ao cadastrar ou editar o animal.</p>
          </div>
        </section>
      </div>

      {estado.erro && <p className="form-error" role="alert">{estado.erro}</p>}
      <div className="page-actions">
        <Link className="outline-link" href="/comedouros">Cancelar</Link>
        <button className="primary-button" disabled={pendente} type="submit">
          {pendente ? "Salvando..." : comedouro ? "Salvar alterações" : "Salvar comedouro"}
        </button>
      </div>
    </form>
  );
}
