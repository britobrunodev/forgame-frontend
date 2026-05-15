import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Clock, Loader2, XCircle } from 'lucide-react';
import { useLanguage } from '@/i18n';
import { championshipApi, championshipSubscriptionsApi } from '@/lib/api';
import { notify } from '@/lib/notify';
import { useSession } from '@/session';
import type { ChampionshipSubscriptionApproval } from '@/lib/api';

const ManagementChampionshipApprovals = () => {
  const { t } = useLanguage();
  const { token } = useSession();
  const navigate = useNavigate();
  const { championshipId } = useParams<{ championshipId: string }>();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const perPage = 12;

  const { data: championship } = useQuery({
    queryKey: ['championship', championshipId],
    queryFn: () => championshipApi.get(token!, championshipId!),
    enabled: !!token && !!championshipId,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['championship-approvals', championshipId, page],
    queryFn: () => championshipSubscriptionsApi.listWaitingApproval(token!, championshipId!, page, perPage),
    enabled: !!token && !!championshipId,
  });

  const approvals: ChampionshipSubscriptionApproval[] = data?.items ?? [];
  const totalPages = data?.total_pages ?? 1;

  const approveMutation = useMutation({
    mutationFn: (subscriptionId: number) => championshipSubscriptionsApi.approve(token!, subscriptionId),
    onSuccess: (_data, subscriptionId) => {
      const name = approvals.find((a) => a.id === subscriptionId)?.user_name;
      queryClient.invalidateQueries({ queryKey: ['championship-approvals', championshipId] });
      notify.success('Inscrição aprovada', name);
    },
    onError: (err) => notify.error(err instanceof Error ? err.message : 'Erro ao aprovar'),
  });

  const rejectMutation = useMutation({
    mutationFn: (subscriptionId: number) => championshipSubscriptionsApi.reject(token!, subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['championship-approvals', championshipId] });
      notify.success('Inscrição rejeitada');
    },
    onError: (err) => notify.error(err instanceof Error ? err.message : 'Erro ao rejeitar'),
  });

  const isMutating = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div className="mx-auto w-full max-w-[min(72rem,calc(100vw-2rem))] space-y-8">
      <header className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/management/championships')}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background/60 text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">Aprovações</p>
          {championship && <p className="mt-0.5 truncate text-xs text-muted-foreground">{championship.name}</p>}
        </div>
      </header>

      <section className="space-y-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="mt-5 space-y-2">
            {approvals.map((req) => (
              <div key={req.id} className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
                <span className="inline-flex items-center justify-center rounded-full border border-yellow-500/30 bg-yellow-500/10 p-1.5 text-yellow-400">
                  <Clock className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="truncate font-medium text-sm">{req.user_name}</span>
                    <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:block">{req.user_email}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{new Date(req.created_at).toLocaleDateString('pt-BR')}</span>
                    <span>·</span>
                    <span className="capitalize">{req.category_slug} · {req.audience_slug}</span>
                  </div>
                </div>
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
              </div>
            ))}
            {approvals.length === 0 ? (
              <div className="py-10 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-muted-foreground/30" />
              </div>
            ) : null}
          </div>
        )}
        {!isLoading && (
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
            <div className="flex items-center gap-2">
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
            <span className="text-xs text-muted-foreground">{data?.total ?? 0} inscrições</span>
          </div>
        )}
      </section>
    </div>
  );
};

export default ManagementChampionshipApprovals;
