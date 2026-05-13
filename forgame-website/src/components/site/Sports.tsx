import footvolley from "@website/assets/sport-footvolley.jpg";
import beachtennis from "@website/assets/sport-beachtennis.jpg";
import { ArrowUpRight } from "lucide-react";

const sports = [
  { img: footvolley, name: "Futevôlei", tag: "Em destaque", desc: "Torneios, ranking de duplas e gestão de areninha." },
  { img: beachtennis, name: "Beach Tennis", tag: "Em destaque", desc: "Chaveamento por categoria, súmula digital e inscrições." },
];

const more = ["Padel", "Tênis", "Vôlei", "Society", "Futsal", "Basquete", "Squash", "Pickleball"];

export function Sports() {
  return (
    <section id="sports" className="relative bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">esportes</p>
            <h2 className="mt-3 font-display text-4xl font-bold text-balance text-foreground md:text-5xl">
              Comece com seu esporte favorito.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            Lançamos com foco em <span className="text-foreground font-semibold">futevôlei</span> e{" "}
            <span className="text-foreground font-semibold">beach tennis</span>, mas a plataforma é construída para qualquer esporte.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {sports.map((s) => (
            <article key={s.name} className="group relative overflow-hidden rounded-3xl ring-frame">
              <div className="aspect-[4/5] w-full overflow-hidden md:aspect-[16/11]">
                <img
                  src={s.img}
                  alt={s.name}
                  loading="lazy"
                  width={900}
                  height={1100}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="inline-block rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary-foreground">
                  {s.tag}
                </span>
                <h3 className="mt-3 font-display text-3xl font-bold text-foreground">{s.name}</h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-3xl ring-frame p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm uppercase tracking-widest text-muted-foreground">Em breve</p>
            <a href="#contact" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Sugerir esporte <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {more.map((m) => (
              <span key={m} className="rounded-full border border-border bg-background/50 px-4 py-2 text-sm text-foreground">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
