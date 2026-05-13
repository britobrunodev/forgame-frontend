import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Trash2, ShieldCheck } from 'lucide-react';
import { useSession } from '@/session';

const AdminHub = () => {
  const { currentUser } = useSession();
  const navigate = useNavigate();

  if (!currentUser.isAdmin) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <div className="inline-flex items-center gap-2 rounded-full border border-live/30 bg-live/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-live">
            <ShieldCheck className="h-3.5 w-3.5" />
            Apenas administradores
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[min(72rem,calc(100vw-2rem))] space-y-6">
      <header>
        <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-violet-400">Dashboard</p>
        <h1 className="font-display text-2xl font-black">Administração</h1>
        <p className="mt-2 text-sm text-muted-foreground">Selecione uma área administrativa.</p>
      </header>

      <section className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        <QuickAction
          icon={<ClipboardList className="h-4 w-4 text-violet-300 sm:h-5 sm:w-5" />}
          label="Aprovações"
          onClick={() => navigate('/admin/approvals')}
        />
        <QuickAction
          icon={<Trash2 className="h-4 w-4 text-violet-300 sm:h-5 sm:w-5" />}
          label="Exclusões"
          onClick={() => navigate('/admin/complexes')}
        />
      </section>
    </div>
  );
};

const QuickAction = ({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-gradient-card p-2.5 text-center transition-smooth hover:border-violet-400/30 hover:bg-secondary/60 sm:gap-2 sm:p-3"
  >
    <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-background/40 sm:h-10 sm:w-10">
      {icon}
    </div>
    <span className="line-clamp-2 text-[9px] font-bold uppercase leading-tight tracking-[0.1em] text-muted-foreground sm:text-[10px] sm:tracking-[0.15em]">{label}</span>
  </button>
);

export default AdminHub;
