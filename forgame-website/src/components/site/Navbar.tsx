import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import logo from "@website/assets/forgame-logo.png";

const links = [
  { href: "#features", label: "Recursos" },
  { href: "#sports", label: "Esportes" },
  { href: "#pricing", label: "Planos" },
  { href: "#contact", label: "Contato" },
];

export function Navbar() {
  return (
    <header className="absolute inset-x-0 top-0 z-30" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Forgame" className="h-9 w-auto" />
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="text-sm text-muted-foreground transition hover:text-foreground">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90"
        >
          Entrar <ArrowUpRight className="h-4 w-4" />
        </Link>
      </nav>
    </header>
  );
}
