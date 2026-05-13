import complex from "@website/assets/complex.jpg";
import tournament from "@website/assets/tournament.jpg";
import { Check } from "lucide-react";

export function Showcase() {
  return (
    <section className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl space-y-24 px-6">
        <Row
          eyebrow="complexo esportivo"
          title="Quadras lotadas, agenda no controle."
          desc="Cobrança automática, confirmação por WhatsApp e bloqueio por horário. Reduza no-shows e aumente a ocupação das suas quadras."
          bullets={["Reserva online 24/7", "Pix, cartão e mensalistas", "Bloqueios e manutenções", "Painel por professor"]}
          image={complex}
        />
        <Row
          reverse
          eyebrow="torneios"
          title="Do chaveamento à premiação."
          desc="Crie torneios em minutos com inscrição online, súmula digital, ranking ao vivo e divulgação automática para os atletas."
          bullets={["Chaveamento automático", "Súmula digital ao vivo", "Ranking por categoria", "Pagamentos integrados"]}
          image={tournament}
        />
      </div>
    </section>
  );
}

function Row({
  eyebrow, title, desc, bullets, image, reverse,
}: {
  eyebrow: string; title: string; desc: string; bullets: string[]; image: string; reverse?: boolean;
}) {
  return (
    <div className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
      <div className="overflow-hidden rounded-3xl ring-frame shadow-elevated">
        <img src={image} alt={title} loading="lazy" className="h-full w-full object-cover" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        <h2 className="mt-3 font-display text-4xl font-bold text-balance text-foreground md:text-5xl">{title}</h2>
        <p className="mt-4 max-w-lg text-muted-foreground">{desc}</p>
        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-2 text-sm text-foreground">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/20 text-primary">
                <Check className="h-3 w-3" />
              </span>
              {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
