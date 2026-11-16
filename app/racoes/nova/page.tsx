import { AppShell } from "@/app/_components/app-shell";
import { exigirUsuario } from "@/lib/auth";
import NovaRacaoForm from "./form";

export const instant = false;

export default async function NovaRacaoPage() {
  const usuario = await exigirUsuario();

  return (
    <AppShell nome={usuario.nome} email={usuario.email}>
      <header className="page-heading">
        <div>
          <h1>Nova ração</h1>
          <p>Informe a densidade para calcular a quantidade por refeição.</p>
        </div>
      </header>
      <NovaRacaoForm />
    </AppShell>
  );
}
