import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Loader2, Trash2, ShieldCheck, Check } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { notify } from '@/lib/notify';
import { useSession } from '@/session';

const PER_PAGE = 12;

const AdminComplexes = () => {
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
    <div className="mx-auto w-full max-w-[min(72rem,calc(100vw-2rem))] space-y-8">
      <header>
        <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-violet-400">Complexos</p>
        <p className="mt-3 text-sm text-muted-foreground">
          Gerencie complexos, configure o repasse e remova complexos e tudo associado a eles.
        </p>
      </header>

      <section className="space-y-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : complexes.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            Nenhum complexo cadastrado.
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {pageItems.map((c) => (
                <div key={c.id} className="rounded-xl border border-border px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{c.name}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{c.city ?? '—'} · {c.country ?? '—'}</div>
                    </div>
                    <StatusBadge active={c.is_active} />
                  </div>
                  <div className="mt-3">
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Repasse ao Complexo</div>
                    <SplitInput complexId={c.id} complexName={c.name} initialValue={c.split_percentage} token={token!} />
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
            <div className="hidden overflow-x-auto md:block">
              <div className="min-w-[860px]">
                <div className="grid grid-cols-[5%_26%_20%_11%_18%_20%] border-b border-border px-5 py-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  <div className="text-center">ID</div>
                  <div className="text-center">Nome</div>
                  <div className="text-center">Cidade</div>
                  <div className="text-center">Status</div>
                  <div className="text-center">Repasse (%)</div>
                  <div className="text-center">Ações</div>
                </div>
                <div className="mt-2 space-y-2">
                  {pageItems.map((c) => (
                    <div key={c.id} className="grid grid-cols-[5%_26%_20%_11%_18%_20%] items-center rounded-xl border border-border px-5 py-4 transition-smooth hover:bg-primary/5">
                      <div className="text-center text-xs text-muted-foreground">{c.id}</div>
                      <div className="text-center">
                        <div className="truncate font-semibold">{c.name}</div>
                      </div>
                      <div className="text-center text-sm text-muted-foreground">
                        {c.city ?? '—'}{c.country ? ` · ${c.country}` : ''}
                      </div>
                      <div className="text-center">
                        <StatusBadge active={c.is_active} />
                      </div>
                      <div className="text-center">
                        <div className="flex justify-center">
                          <SplitInput complexId={c.id} complexName={c.name} initialValue={c.split_percentage} token={token!} />
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex justify-center">
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
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/60 transition-smooth disabled:opacity-40 hover:border-primary/40 hover:bg-secondary"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/60 transition-smooth disabled:opacity-40 hover:border-primary/40 hover:bg-secondary"
                  aria-label="Próxima página"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <span className="text-xs text-muted-foreground">{complexes.length} complexos</span>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

const SplitInput = ({
  complexId,
  complexName,
  initialValue,
  token,
}: {
  complexId: number;
  complexName: string;
  initialValue: number | null;
  token: string;
}) => {
  const savedRef = useRef<string>(initialValue !== null ? String(initialValue) : '');
  const [draft, setDraft] = useState<string>(initialValue !== null ? String(initialValue) : '');
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const isDirty = draft !== savedRef.current && draft !== '';

  const handleChange = (raw: string) => {
    setDraft(raw);
    const n = Number(raw);
    setError(raw !== '' && (isNaN(n) || n < 0 || n > 100));
  };

  const handleSave = async () => {
    const val = Number(draft);
    if (isNaN(val) || val < 0 || val > 100) {
      setError(true);
      return;
    }
    setError(false);
    setSaving(true);
    try {
      await adminApi.updateComplexSplit(token, complexId, val);
      savedRef.current = draft;
      setDraft(draft);
      notify.success('Repasse salvo', `${val}% para o ${complexName}.`);
    } catch (err) {
      notify.error('Erro ao salvar', err instanceof Error ? err.message : 'Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={draft}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="90"
          className={`w-16 rounded-lg border bg-background/60 px-2 py-1 text-center font-mono text-sm transition-smooth focus:outline-none ${
            error ? 'border-destructive/60 text-destructive' : 'border-border focus:border-primary/40'
          }`}
        />
        <span className="text-xs text-muted-foreground">%</span>
        {isDirty && !error && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan transition-smooth hover:bg-neon-cyan/20 disabled:opacity-40"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
      {error && <p className="text-[10px] text-destructive">0 – 100</p>}
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

export default AdminComplexes;
