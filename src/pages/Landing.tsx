import { Link } from 'react-router-dom';
import { ArrowRight, Trophy, MapPin, Users } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-display text-xl font-bold tracking-widest text-neon-cyan uppercase">
            Forgame
          </span>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-muted-foreground transition-smooth hover:text-foreground"
            >
              Entrar
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-gradient-primary px-4 py-2 text-sm font-bold uppercase tracking-widest shadow-neon transition-smooth hover:brightness-110 hover:shadow-glow"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 pt-20 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neon-cyan/30 bg-neon-cyan/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-neon-cyan">
          Plataforma de esportes
        </div>
        <h1 className="mb-6 max-w-3xl font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
          Gerencie seus{' '}
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            campeonatos
          </span>{' '}
          e quadras em um só lugar
        </h1>
        <p className="mb-10 max-w-xl text-base text-muted-foreground sm:text-lg">
          Forgame conecta jogadores, gestores e professores numa plataforma
          completa para organizar torneios, reservar quadras e acompanhar
          resultados.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link
            to="/register"
            className="flex items-center gap-2 rounded-lg bg-gradient-primary px-8 py-3.5 font-display text-sm font-bold uppercase tracking-widest shadow-neon transition-smooth hover:brightness-110 hover:shadow-glow"
          >
            Começar agora <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/login"
            className="rounded-lg border border-border px-8 py-3.5 text-sm font-bold uppercase tracking-widest transition-smooth hover:border-primary/40 hover:text-foreground"
          >
            Já tenho conta
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            {
              icon: Trophy,
              title: 'Campeonatos',
              description:
                'Crie e gerencie torneios com chaves automáticas, inscrições e resultados em tempo real.',
            },
            {
              icon: MapPin,
              title: 'Quadras',
              description:
                'Encontre e reserve quadras esportivas perto de você. Gestores controlam disponibilidade e preços.',
            },
            {
              icon: Users,
              title: 'Comunidade',
              description:
                'Conecte-se com outros jogadores, forme equipes e acompanhe seu histórico de partidas.',
            },
          ].map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-card/40 p-6 transition-smooth hover:border-primary/30"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-neon-cyan" />
              </div>
              <h3 className="mb-2 font-display text-base font-bold uppercase tracking-wider">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/40 py-24 text-center">
        <h2 className="mb-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Pronto para jogar?
        </h2>
        <p className="mb-8 text-muted-foreground">
          Crie sua conta gratuitamente e comece hoje.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-8 py-3.5 font-display text-sm font-bold uppercase tracking-widest shadow-neon transition-smooth hover:brightness-110 hover:shadow-glow"
        >
          Criar conta <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Forgame. Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default Landing;
