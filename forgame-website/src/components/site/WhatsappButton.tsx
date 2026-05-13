import { MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from "@website/lib/contact";

export function WhatsappButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold text-background shadow-elevated transition hover:scale-105"
      style={{ backgroundColor: "hsl(var(--whatsapp))" }}
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">Fale no WhatsApp</span>
      <span className="absolute inset-0 -z-10 animate-ping rounded-full opacity-30" style={{ backgroundColor: "hsl(var(--whatsapp))" }} />
    </a>
  );
}
