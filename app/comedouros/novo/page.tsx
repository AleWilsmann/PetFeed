import { AppShell } from "@/app/_components/app-shell";
import { exigirUsuario } from "@/lib/auth";
import NovoComedouroForm from "./form";

export const instant = false;

export default async function NovoComedouroPage() {
  const usuario = await exigirUsuario();

  return (
    <AppShell nome={usuario.nome} email={usuario.email}>
      <header className="page-heading">
        <div>
          <h1>Novo comedouro</h1>
          <p>Cadastre o dispositivo e configure a dosagem.</p>
        </div>
      </header>
      <NovoComedouroForm />
    </AppShell>
  );
}
