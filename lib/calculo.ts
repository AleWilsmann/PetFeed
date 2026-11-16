export type ParametrosCalculo = {
  porcaoG: number;
  densidadeGml: number;
  fatorAjuste: number;
  vazaoMlPorS: number;
  tempoMaximoS: number;
};

export type ResultadoCalculo = {
  tempoMs: number;
  limitado: boolean; // true se bateu no tempo máximo
  vazaoGPorS: number;
};

export function calcularTempo(p: ParametrosCalculo): ResultadoCalculo {
  const vazaoGPorS = p.vazaoMlPorS * p.densidadeGml * p.fatorAjuste;

  if (!(vazaoGPorS > 0)) {
    return { tempoMs: 0, limitado: false, vazaoGPorS: 0 };
  }

  const tempoIdealMs = Math.round((p.porcaoG / vazaoGPorS) * 1000);
  const maximoMs = p.tempoMaximoS * 1000;
  const limitado = tempoIdealMs > maximoMs;

  return {
    tempoMs: Math.min(tempoIdealMs, maximoMs),
    limitado,
    vazaoGPorS,
  };
}