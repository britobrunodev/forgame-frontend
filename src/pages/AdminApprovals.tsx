import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, ChevronLeft, ChevronRight, Clock, Loader2, RotateCcw, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n';
import { authApi } from '@/lib/api';
import { useSession } from '@/session';
import type { ApprovalRequest } from '@/lib/api';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const STATUS_BADGE: Record<string, { label: string; className: string; icon: typeof Clock }> = {
  pending: {
    label: 'Pendente',
    className: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
    icon: Clock,
  },
  approved: {
    label: 'Aprovado',
    className: 'border-green-500/30 bg-green-500/10 text-green-400',
    icon: CheckCircle2,
  },
  rejected: {
    label: 'Rejeitado',
    className: 'border-destructive/30 bg-destructive/10 text-destructive',
    icon: XCircle,
  },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_BADGE[status] ?? STATUS_BADGE.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center justify-center rounded-full border p-1.5 ${cfg.className}`} title={cfg.label}>
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
};

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'approved', label: 'Aprovados' },
  { value: 'rejected', label: 'Rejeitados' },
];

const AdminApprovals = () => {
  const { t } = useLanguage();
  const { token } = useSession();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const perPage = 12;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-approvals', page],
    queryFn: () => authApi.getAllApprovals(token!, page, perPage),
    enabled: !!token,
  });
  const approvals = data?.items ?? [];
  const totalPages = data?.total_pages ?? 1;

  const approveMutation = useMutation({
    mutationFn: (requestId: number) => authApi.approveRequest(token!, requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      toast.success(t('approvalApproved'));
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : t('googleAuthError')),
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: number) => authApi.rejectRequest(token!, requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      toast.success(t('approvalRejected'));
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : t('googleAuthError')),
  });

  const revokeMutation = useMutation({
    mutationFn: (requestId: number) => authApi.revokeApproval(token!, requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      toast.success('Aprovação revogada — solicitação voltou para pendente.');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : t('googleAuthError')),
  });

  const isMutating = approveMutation.isPending || rejectMutation.isPending || revokeMutation.isPending;

  const filtered: ApprovalRequest[] = filter === 'all'
    ? approvals
    : approvals.filter((r) => r.status === filter);

  const counts = {
    all: approvals.length,
    pending: approvals.filter((r) => r.status === 'pending').length,
    approved: approvals.filter((r) => r.status === 'approved').length,
    rejected: approvals.filter((r) => r.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">Aprovações</p>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">Gerencie as solicitações de acesso de gestores e revogue permissões quando necessário.</p>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition-smooth ${
              filter === value
                ? 'border-primary/50 bg-primary/10 text-foreground shadow-glow'
                : 'border-border bg-background/40 text-muted-foreground hover:border-primary/30 hover:text-foreground'
            }`}
          >
            {label}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${filter === value ? 'bg-primary/20' : 'bg-secondary'}`}>
              {counts[value]}
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card/40 py-16 text-center">
          <CheckCircle2 className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm font-semibold text-muted-foreground">Nenhuma solicitação encontrada.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((req) => (
            <div key={req.id} className="flex items-center gap-3 rounded-xl border border-border bg-card/40 px-4 py-3 transition-colors hover:bg-card/60">
              <StatusBadge status={req.status} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="truncate font-medium text-sm">{req.user_name}</span>
                  <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:block">{req.user_email}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>{new Date(req.created_at).toLocaleDateString('pt-BR')}</span>
                  {req.reviewed_by_name && (
                    <>
                      <span>·</span>
                      <span>{req.reviewed_by_name}</span>
                    </>
                  )}
                </div>
              </div>
              {req.status === 'pending' ? (
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => approveMutation.mutate(req.id)}
                    disabled={isMutating}
                    title={t('approve')}
                    className="flex items-center justify-center rounded-lg border border-green-500/30 bg-green-500/10 p-2 text-green-400 transition-smooth hover:bg-green-500/20 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => rejectMutation.mutate(req.id)}
                    disabled={isMutating}
                    title={t('reject')}
                    className="flex items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-destructive transition-smooth hover:bg-destructive/20 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              ) : req.status === 'approved' ? (
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => revokeMutation.mutate(req.id)}
                    disabled={isMutating}
                    title="Revogar aprovação"
                    className="flex items-center justify-center rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-2 text-yellow-400 transition-smooth hover:bg-yellow-500/20 disabled:opacity-50"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setPage(page - 1)}
          disabled={page <= 1}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/60 transition-smooth disabled:opacity-40 hover:border-primary/40 hover:bg-secondary"
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
        <button
          type="button"
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/60 transition-smooth disabled:opacity-40 hover:border-primary/40 hover:bg-secondary"
          aria-label="Próxima página"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default AdminApprovals;
