import logo from "@website/assets/forgame-logo.png";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-10">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Forgame" className="h-8 w-auto" />
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Forgame. Feito para o esporte brasileiro.
        </p>
        <div className="flex gap-5 text-xs text-muted-foreground">
          <a href="#features" className="hover:text-foreground">Recursos</a>
          <a href="#pricing" className="hover:text-foreground">Planos</a>
          <a href="#contact" className="hover:text-foreground">Contato</a>
        </div>
      </div>
    </footer>
  );
}
