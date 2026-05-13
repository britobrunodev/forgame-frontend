import { Check } from "lucide-react";

const plans = [
  {
    name: "Start", price: "R$ 89", period: "/mês",
    desc: "Para professores e arenas iniciando.",
    features: ["1 quadra", "Reservas online", "Até 50 alunos", "Suporte por WhatsApp"],
  },
  {
    name: "Pro", price: "R$ 249", period: "/mês",
    desc: "Para complexos em crescimento.",
    features: ["Quadras ilimitadas", "Torneios ilimitados", "Alunos ilimitados", "Financeiro completo", "Múltiplos professores"],
    highlight: true,
  },
  {
    name: "Arena+", price: "Sob consulta", period: "",
    desc: "Para grandes operações e franquias.",
    features: ["Multi-unidades", "API e integrações", "Gerente de conta", "Onboarding dedicado"],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">planos</p>
          <h2 className="mt-3 font-display text-4xl font-bold text-balance text-foreground md:text-5xl">
            Preço simples, sem letra miúda.
          </h2>
          <p className="mt-4 text-muted-foreground">7 dias grátis em qualquer plano. Cancele quando quiser.</p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-3xl p-7 ring-frame ${p.highlight ? "bg-gradient-primary text-primary-foreground shadow-glow" : ""}`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-7 rounded-full bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
                  mais popular
                </span>
              )}
              <h3 className={`font-display text-2xl font-bold ${p.highlight ? "" : "text-foreground"}`}>{p.name}</h3>
              <p className={`mt-1 text-sm ${p.highlight ? "opacity-80" : "text-muted-foreground"}`}>{p.desc}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className={`font-display text-5xl font-bold ${p.highlight ? "" : "text-foreground"}`}>{p.price}</span>
                <span className={p.highlight ? "opacity-80" : "text-muted-foreground"}>{p.period}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4" /> {f}
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                  p.highlight ? "bg-background text-foreground hover:opacity-90" : "bg-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                {p.highlight ? "Começar agora" : "Falar com vendas"}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
