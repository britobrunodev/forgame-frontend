import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, ChevronLeft, ChevronRight, Clock, Loader2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/i18n';
import { authApi } from '@/lib/api';
import { notify } from '@/lib/notify';
import { useSession } from '@/session';

const ManagementApprovals = () => {
  const { t } = useLanguage();
  const { token } = useSession();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const perPage = 12;

  const { data, isLoading } = useQuery({
    queryKey: ['approvals', page],
    queryFn: () => authApi.getApprovals(token!, page, perPage),
    enabled: !!token,
  });
  const approvals = data?.items ?? [];
  const totalPages = data?.total_pages ?? 1;

  const approveMutation = useMutation({
    mutationFn: (requestId: number) => authApi.approveRequest(token!, requestId),
    onSuccess: (_data, requestId) => {
      const email = approvals.find((a) => a.id === requestId)?.user_email;
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      notify.success(t('approvalApproved'), email);
    },
    onError: (err) => notify.error(err instanceof Error ? err.message : t('googleAuthError')),
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: number) => authApi.rejectRequest(token!, requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      notify.success(t('approvalRejected'));
    },
    onError: (err) => notify.error(err instanceof Error ? err.message : t('googleAuthError')),
  });

  const isPending = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{t('approvals')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('approvalsPageIntro')}</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : approvals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card/40 py-16 text-center">
          <CheckCircle2 className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm font-semibold text-muted-foreground">{t('noApprovals')}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-card/60">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  {t('fullName')}
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  {t('email')}
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  {t('role')}
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  {t('requestedAt')}
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {approvals.map((req) => (
                <tr key={req.id} className="bg-card/30 transition-colors hover:bg-card/60">
                  <td className="px-4 py-3 font-medium">{req.user_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{req.user_email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.15em] text-neon-cyan">
                      <Clock className="h-3 w-3" />
                      {req.requested_role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(req.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => approveMutation.mutate(req.id)}
                        disabled={isPending}
                        className="flex items-center gap-1.5 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-green-400 transition-smooth hover:bg-green-500/20 disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {t('approve')}
                      </button>
                      <button
                        onClick={() => rejectMutation.mutate(req.id)}
                        disabled={isPending}
                        className="flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-destructive transition-smooth hover:bg-destructive/20 disabled:opacity-50"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        {t('reject')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

export default ManagementApprovals;
