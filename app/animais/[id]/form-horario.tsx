"use client";

import { useActionState } from "react";
import { criarHorario } from "@/app/actions/horarios";
import type { EstadoForm } from "@/app/actions/auth";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function FormHorario({ animalId }: { animalId: string }) {
  const [estado, acao, pendente] = useActionState<EstadoForm, FormData>(
    criarHorario,
    {}
  );

  return (
    <form action={acao} className="schedule-form">
      <input type="hidden" name="animalId" value={animalId} />

      <div className="field-grid">
        <label className="field">
          Hora
          <input name="hora" type="time" required />
        </label>
        <label className="field">
          Porção (g)
          <input name="porcao" required inputMode="decimal" placeholder="Ex.: 60" />
        </label>
      </div>

      <fieldset className="weekday-fieldset">
        <legend>Dias da semana</legend>
        {DIAS.map((nome, i) => (
          <label key={i} className="weekday-option">
            <input type="checkbox" name="dias" value={i} defaultChecked />
            {nome}
          </label>
        ))}
      </fieldset>

      {estado.erro && <p className="form-error" role="alert">{estado.erro}</p>}

      <button className="primary-button" disabled={pendente} type="submit">
        {pendente ? "Salvando..." : "Adicionar horário"}
      </button>
    </form>
  );
}