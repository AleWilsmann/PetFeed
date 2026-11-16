"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { sair } from "@/app/actions/auth";
import { Icon } from "./icons";

const links = [
  { href: "/painel", label: "Início", icon: "home" as const },
  { href: "/animais", label: "Animais", icon: "paw" as const },
  { href: "/comedouros", label: "Comedouros", icon: "bowl" as const },
  { href: "/horarios", label: "Horários", icon: "clock" as const },
  { href: "/racoes", label: "Rações", icon: "food" as const },
];

function iniciais(nome: string) {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toLocaleUpperCase("pt-BR") ?? "")
    .join("");
}

export function AppShell({
  children,
  nome,
  email,
}: {
  children: ReactNode;
  nome: string;
  email: string;
}) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/painel">
          <Icon name="paw" />
          <span>PetFeed</span>
        </Link>

        <nav aria-label="Navegação principal" className="sidebar-nav">
          {links.map((link) => {
            const ativo =
              link.href === "/painel"
                ? pathname === link.href
                : pathname.startsWith(link.href);

            return (
              <Link
                aria-current={ativo ? "page" : undefined}
                className={`sidebar-link${ativo ? " is-active" : ""}`}
                href={link.href}
                key={link.href}
              >
                <Icon name={link.icon} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-note">
          <span className="sidebar-note-icon">
            <Icon name="check" />
          </span>
          <p>Uma rotina mais leve para você e seu pet.</p>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <Link className="brand mobile-brand" href="/painel">
            <Icon name="paw" />
            <span>PetFeed</span>
          </Link>
          <div className="profile-summary" title={email}>
            <span className="avatar">{iniciais(nome)}</span>
            <span className="profile-name">{nome}</span>
          </div>
          <form action={sair}>
            <button className="logout-button" type="submit">
              Sair
            </button>
          </form>
        </header>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
