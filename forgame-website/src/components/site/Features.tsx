import { Trophy, CalendarDays, Users, Wallet, BarChart3, Bell } from "lucide-react";

const features = [
  { icon: Trophy, title: "Torneios completos", desc: "Crie chaveamentos, gerencie inscrições, súmulas e premiações." },
  { icon: CalendarDays, title: "Reserva de quadras", desc: "Agenda inteligente com pagamento online e confirmação automática." },
  { icon: Users, title: "Alunos & turmas", desc: "Controle de aulas, presenças, mensalidades e evolução." },
  { icon: Wallet, title: "Financeiro integrado", desc: "Receitas, despesas e relatórios com fechamento por professor." },
  { icon: BarChart3, title: "Métricas em tempo real", desc: "Acompanhe ocupação, faturamento e ranking de jogadores." },
  { icon: Bell, title: "Comunicação direta", desc: "Avisos automáticos no WhatsApp para alunos e participantes." },
];

export function Features() {
  return (
    <section id="features" className="relative bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">recursos</p>
          <h2 className="mt-3 font-display text-4xl font-bold text-balance text-foreground md:text-5xl">
            Tudo que seu complexo precisa, em um só lugar.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Da inscrição em torneios à mensalidade do aluno, automatizamos a parte chata para você focar no jogo.
          </p>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-3xl ring-frame p-6 transition hover:-translate-y-1"
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl opacity-0 transition group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
