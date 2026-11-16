import type { ReactNode } from "react";
import { Icon } from "./icons";

export function AuthShell({
  children,
  cadastro = false,
}: {
  children: ReactNode;
  cadastro?: boolean;
}) {
  return (
    <main className="auth-shell">
      <section className="auth-brand-panel">
        <div className="auth-brand">
          <Icon name="paw" />
          <span>PetFeed</span>
        </div>
        <div aria-hidden="true" className="brand-illustration">
          <Icon name="bowl" />
        </div>
        <div className="brand-message">
          <h2>
            {cadastro
              ? "Cuide da rotina do seu pet em poucos toques."
              : "Ração na hora certa, mesmo quando você não está."}
          </h2>
          <ul>
            <li>
              <span><Icon name="check" /></span>
              Horários programados para cada pet
            </li>
            <li>
              <span><Icon name="check" /></span>
              Vários comedouros em uma só conta
            </li>
            <li>
              <span><Icon name="check" /></span>
              Acompanhe a rotina de alimentação
            </li>
          </ul>
        </div>
      </section>
      <section className="auth-form-panel">{children}</section>
    </main>
  );
}
