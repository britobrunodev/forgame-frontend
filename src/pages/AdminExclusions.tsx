import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, ChevronLeft, ChevronRight, Loader2, Trash2, ShieldCheck } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { notify } from '@/lib/notify';
import { useSession } from '@/session';

const PER_PAGE = 12;

const AdminExclusions = () => {
  const { token, currentUser } = useSession();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const [page, setPage] = useState(1);

  const { data: complexes = [], isLoading } = useQuery({
    queryKey: ['admin-complexes'],
    queryFn: () => adminApi.listComplexes(token!),
    enabled: !!token && currentUser.isAdmin,
  });

  const totalPages = Math.max(1, Math.ceil(complexes.length / PER_PAGE));
  const pageItems = complexes.slice((page - 1) * PER_PAGE, page * PER_PAGE);

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

  const handleDelete = async (id: number, name: string) => {
    if (confirmId !== id) {
      setConfirmId(id);
      return;
    }
    setDeletingId(id);
    setConfirmId(null);
    try {
      await adminApi.deleteComplex(token!, id);
      await queryClient.invalidateQueries({ queryKey: ['admin-complexes'] });
      await queryClient.invalidateQueries({ queryKey: ['complexes-public'] });
      await queryClient.invalidateQueries({ queryKey: ['complexes'] });
      notify.success('Complexo excluído', `${name} foi removido com sucesso.`);
    } catch (err) {
      notify.error('Erro ao excluir', err instanceof Error ? err.message : 'Tente novamente.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[min(108rem,calc(100vw-2rem))] space-y-8">
      <header>
        <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-violet-400">Admin</p>
        <h1 className="font-display text-2xl font-black">Exclusões</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Remove um complexo e tudo associado a ele: quadras, campeonatos e vínculos de usuários.
        </p>
      </header>

      <section className="rounded-[2rem] border border-border bg-gradient-card p-4 shadow-card sm:p-6">
        <div className="mb-5 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-violet-400" />
          <h2 className="font-display text-lg font-bold">Complexos</h2>
          {!isLoading && (
            <span className="ml-1 rounded-full border border-border bg-background/40 px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
              {complexes.length}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : complexes.length === 0 ? (
          <div className="rounded-2xl border border-border bg-background/25 px-5 py-10 text-center text-sm text-muted-foreground">
            Nenhum complexo cadastrado.
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {pageItems.map((c) => (
                <div key={c.id} className="rounded-2xl border border-border bg-background/25 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{c.name}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{c.city ?? '—'} · {c.country ?? '—'}</div>
                    </div>
                    <StatusBadge active={c.is_active} />
                  </div>
                  <div className="mt-3">
                    <DeleteButton
                      id={c.id}
                      name={c.name}
                      confirmId={confirmId}
                      deletingId={deletingId}
                      onDelete={handleDelete}
                      onCancel={() => setConfirmId(null)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto rounded-2xl border border-border md:block">
              <table className="w-full table-fixed text-sm">
                <colgroup>
                  <col className="w-[6%]" />
                  <col className="w-[32%]" />
                  <col className="w-[24%]" />
                  <col className="w-[14%]" />
                  <col className="w-[24%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-border bg-background/30 text-left text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    <th className="px-5 py-3">ID</th>
                    <th className="px-5 py-3">Nome</th>
                    <th className="px-5 py-3">Cidade</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pageItems.map((c) => (
                    <tr key={c.id} className="transition-smooth hover:bg-primary/5">
                      <td className="px-5 py-4 text-xs text-muted-foreground">{c.id}</td>
                      <td className="px-5 py-4">
                        <div className="truncate font-semibold">{c.name}</div>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {c.city ?? '—'}{c.country ? ` · ${c.country}` : ''}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge active={c.is_active} />
                      </td>
                      <td className="px-5 py-4">
                        <DeleteButton
                          id={c.id}
                          name={c.name}
                          confirmId={confirmId}
                          deletingId={deletingId}
                          onDelete={handleDelete}
                          onCancel={() => setConfirmId(null)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {complexes.length > 0 && (
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/60 transition-smooth disabled:opacity-40 hover:border-primary/40 hover:bg-secondary"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/60 transition-smooth disabled:opacity-40 hover:border-primary/40 hover:bg-secondary"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-xs text-muted-foreground">{complexes.length} complexos</span>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

const StatusBadge = ({ active }: { active: boolean }) => (
  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
    active
      ? 'border-neon-cyan/20 bg-neon-cyan/10 text-neon-cyan'
      : 'border-border bg-background/40 text-muted-foreground'
  }`}>
    {active ? 'Ativo' : 'Inativo'}
  </span>
);

const DeleteButton = ({
  id,
  name,
  confirmId,
  deletingId,
  onDelete,
  onCancel,
}: {
  id: number;
  name: string;
  confirmId: number | null;
  deletingId: number | null;
  onDelete: (id: number, name: string) => void;
  onCancel: () => void;
}) => {
  const isDeleting = deletingId === id;
  const isConfirming = confirmId === id;

  if (isDeleting) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Excluindo…
      </span>
    );
  }

  if (isConfirming) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onDelete(id, name)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive transition-smooth hover:bg-destructive/20"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Confirmar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-muted-foreground transition-smooth hover:text-foreground"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onDelete(id, name)}
      disabled={deletingId !== null}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-smooth hover:border-destructive/40 hover:text-destructive disabled:opacity-40"
    >
      <Trash2 className="h-3.5 w-3.5" />
      Excluir
    </button>
  );
};

export default AdminExclusions;
