"use client";

import { useEffect, useState } from "react";

type StatusRefeicaoProps = {
  horarioId: string;
  texto: string;
  classe: string;
};

export default function StatusRefeicao({
  horarioId,
  texto: textoInicial,
  classe: classeInicial,
}: StatusRefeicaoProps) {
  const [status, setStatus] = useState({
    texto: textoInicial,
    classe: classeInicial,
  });

  useEffect(() => {
    let ativo = true;

    async function atualizar() {
      try {
        const resposta = await fetch(`/api/horarios/status?horarioId=${encodeURIComponent(horarioId)}`, {
          cache: "no-store",
        });
        if (!resposta.ok) throw new Error(`Falha ao consultar status (${resposta.status}).`);
        const novoStatus = await resposta.json() as { texto: string; classe: string };
        if (ativo) setStatus(novoStatus);
      } catch (erro) {
        console.error("Não foi possível atualizar o status da refeição.", erro);
      }
    }

    const intervalo = window.setInterval(atualizar, 10_000);
    return () => window.clearInterval(intervalo);
  }, [horarioId]);

  return (
    <span aria-live="polite" className={`status-pill ${status.classe}`}>
      {status.texto}
    </span>
  );
}
