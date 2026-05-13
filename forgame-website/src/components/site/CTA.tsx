import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from "@website/lib/contact";

export function CTA() {
  const wa = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
  return (
    <section id="contact" className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-primary p-10 md:p-16 shadow-glow">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-background/10 blur-3xl" />
          <div className="absolute -left-10 -bottom-20 h-72 w-72 rounded-full bg-background/10 blur-3xl" />
          <div className="relative grid items-center gap-8 md:grid-cols-2">
            <div>
              <h2 className="font-display text-4xl font-bold text-balance text-primary-foreground md:text-5xl">
                Pronto para encher suas quadras?
              </h2>
              <p className="mt-4 max-w-md text-primary-foreground/80">
                Fale com a gente no WhatsApp e veja a Forgame rodando no seu complexo em menos de 24h.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-background px-6 py-3.5 text-sm font-semibold text-foreground transition hover:opacity-90"
              >
                Chamar no WhatsApp <ArrowUpRight className="h-4 w-4" />
              </a>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full border border-background/40 px-6 py-3.5 text-sm font-semibold text-primary-foreground transition hover:bg-background/10"
              >
                Acessar plataforma
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
