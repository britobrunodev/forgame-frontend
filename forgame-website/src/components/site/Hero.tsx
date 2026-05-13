import heroImg from "@website/assets/hero-athlete.jpg";
import { ArrowUpRight, Play } from "lucide-react";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Plataforma esportiva
          </p>
          <h1 className="text-balance font-display text-5xl font-bold leading-[1.02] text-foreground md:text-7xl lg:text-[5.5rem]">
            Gerencie seu{" "}
            <span className="relative inline-block text-primary">
              esporte
              <svg className="absolute -bottom-2 left-0 h-3 w-full text-primary/60" viewBox="0 0 200 12" preserveAspectRatio="none">
                <path d="M2 8 Q 50 2 100 6 T 198 5" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </span>
            <br />
            como um pro.
          </h1>
          <p className="mt-6 max-w-xl text-balance text-base text-muted-foreground md:text-lg">
            Torneios, reservas de quadra, alunos e financeiro do seu complexo esportivo —
            tudo em uma plataforma feita para futevôlei, beach tennis e muito mais.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:translate-y-[-1px]"
            >
              Começar agora <ArrowUpRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-5 py-3.5 text-sm font-semibold text-foreground backdrop-blur transition hover:bg-surface"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
                <Play className="h-3 w-3 fill-current" />
              </span>
              Ver recursos
            </a>
          </div>

          <div className="mt-12 flex items-center gap-8 border-t border-border/60 pt-8">
            <Stat value="500+" label="Torneios" />
            <div className="h-10 w-px bg-border" />
            <Stat value="20k" label="Reservas/mês" />
            <div className="h-10 w-px bg-border" />
            <Stat value="98%" label="Satisfação" />
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] ring-frame shadow-elevated">
            <img
              src={heroImg}
              alt="Atleta de beach tennis em ação"
              width={1024}
              height={1280}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />

            <div className="absolute left-5 top-5 rounded-full bg-background/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-foreground backdrop-blur">
              ao vivo
            </div>

            <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-background/80 p-4 backdrop-blur-md">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Próximo torneio</p>
              <p className="mt-1 font-display text-lg font-bold text-foreground">Open de Beach Tennis</p>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>32 duplas</span>
                <span className="rounded-full bg-primary px-2 py-0.5 font-semibold text-primary-foreground">Inscrições abertas</span>
              </div>
            </div>
          </div>

          <div className="absolute -left-4 top-1/2 hidden -translate-y-1/2 rounded-2xl bg-surface px-4 py-3 ring-frame shadow-elevated md:block">
            <p className="text-2xl font-display font-bold text-foreground">12+</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">esportes</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-bold text-foreground md:text-3xl">{value}</p>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
