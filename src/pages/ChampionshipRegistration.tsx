import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Loader2, Search, Tag, UserCircle, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { SportIcon } from '@/components/SportIcon';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import { championshipApi, usersApi } from '@/lib/api';
import { notify } from '@/lib/notify';
import type { SportId } from '@/types';

const mapSportSlug = (slug: string | null | undefined): SportId | null => {
  if (slug === 'footvolley') return 'footvolley';
  if (slug === 'beach-tennis') return 'beach-tennis';
  if (slug === 'volleyball') return 'volleyball';
  return null;
};

const formatLabel = (format: string, t: (key: string) => string) => {
  if (format === 'cumbuca') return t('cumbucaFormat');
  if (format === 'rei-da-praia') return t('reiDaPraia');
  if (format === 'dupla-fechada') return t('doublesFormat');
  return format;
};

const categoryName = (categorySlug: string, audienceSlug: string, t: (key: string) => string) =>
  `${t(categorySlug)}${audienceSlug ? ` · ${t(audienceSlug)}` : ''}`;

const ChampionshipRegistration = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language, sportName } = useLanguage();
  const { currentUser, token } = useSession();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<Array<{ id: number; name: string; email: string; level: string | null }>>([]);
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: sports = [] } = useQuery({
    queryKey: ['championship-sports'],
    queryFn: () => championshipApi.listSports(token!),
    enabled: !!token,
  });

  const { data: championship, isLoading, isError, error } = useQuery({
    queryKey: ['championship-registration', id],
    queryFn: () => championshipApi.get(token!, id!),
    enabled: !!token && !!id,
  });

  const sport = useMemo(() => {
    if (!championship?.sport_id) return null;
    const sportRecord = sports.find((item) => item.id === championship.sport_id);
    return mapSportSlug(sportRecord?.slug);
  }, [championship, sports]);

  const categories = championship?.categories ?? [];
  const selectedCategory = categories.find((category) => String(category.id) === selectedCategoryId) ?? null;
  const playersPerTeam = selectedCategory?.players_per_team ?? 1;
  const requiredAdditionalPlayers = Math.max(0, playersPerTeam - 1);

  const { data: playersResponse, isLoading: isLoadingPlayers } = useQuery({
    queryKey: ['championship-registration-players', search],
    queryFn: () => usersApi.listPlayers(token!, 1, 20, search),
    enabled: !!token && !!selectedCategoryId && requiredAdditionalPlayers > 0,
  });

  const searchResults = (playersResponse?.items ?? []).filter(
    (player) => !selectedPlayers.some((selected) => selected.id === player.id),
  );

  const formattedFee = selectedCategory
    ? new Intl.NumberFormat(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
      style: 'currency',
      currency: 'BRL',
    }).format(selectedCategory.entry_fee ?? 0)
    : null;

  const canProceed = selectedCategory !== null && selectedPlayers.length === requiredAdditionalPlayers;

  const handleProceed = () => {
    if (!championship || !selectedCategory || !formattedFee || !token) return;
    const playerIds = [Number(currentUser.id), ...selectedPlayers.map((player) => player.id)];
    const teamName = [currentUser.name, ...selectedPlayers.map((player) => player.name)]
      .map((name) => name.split(' ')[0])
      .join(' & ');

    setIsSubmitting(true);
    championshipApi.createSubscription(token, championship.id, {
      category_id: selectedCategory.id!,
      player_ids: playerIds,
    })
      .then((subscription) => {
        const formattedAmount = new Intl.NumberFormat(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
          style: 'currency',
          currency: 'BRL',
        }).format(subscription.total_amount ?? 0);
        navigate(`/payment/${subscription.payment_id}`, {
          state: {
            paymentId: subscription.payment_id,
            title: t('championshipRegistrations'),
            description: `${t('registrationFor')} ${championship.name}`,
            amount: formattedAmount,
            backTo: `/bookings`,
            complexId: championship.complex_id != null ? String(championship.complex_id) : undefined,
            summary: [
              { label: t('championships'), value: championship.name },
              { label: t('category'), value: categoryName(selectedCategory.category_slug, selectedCategory.audience_slug, t) },
              { label: playersPerTeam === 1 ? 'Jogador' : 'Equipe', value: teamName },
              { label: t('entryFee'), value: formattedAmount },
              { label: 'Formato', value: formatLabel(selectedCategory.format_slug, t) },
              { label: 'Status', value: subscription.payment_status },
            ],
          },
        });
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Erro ao criar inscrição';
        notify.error(message);
      })
      .finally(() => setIsSubmitting(false));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !championship) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : t('championshipNotFound')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[min(72rem,calc(100vw-2rem))] space-y-6">
      <header className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(`/championships/${id}`)}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background/60 text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <p className="font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('championshipRegistrations')}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{t('registerForChampionship')}</p>
        </div>
      </header>

      <section className="rounded-[2rem] border border-border bg-gradient-card p-5 shadow-card sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-background/70">
            {sport ? <SportIcon sportId={sport} className="h-7 w-7 text-neon-cyan" /> : <Tag className="h-7 w-7 text-neon-cyan" />}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
              {sport ? sportName(sport) : t('championships')}
            </p>
            <h1 className="mt-1 font-display text-2xl font-black text-foreground sm:text-3xl">{championship.name}</h1>
          </div>
        </div>
      </section>

      {championship.status !== 'open' ? (
        <section className="rounded-[2rem] border border-border bg-gradient-card p-5 shadow-card sm:p-6">
          <p className="text-sm text-muted-foreground">{t('closedRegistrationsDescription')}</p>
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-border bg-gradient-card p-5 shadow-card sm:p-6">
            <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {t('selectCategory')}
            </div>
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('noCategoriesYet')}</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {categories.map((category) => {
                  const isActive = selectedCategoryId === String(category.id);
                  const catFee = new Intl.NumberFormat(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(category.entry_fee ?? 0);
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategoryId(String(category.id));
                        setSelectedPlayers([]);
                        setSearch('');
                      }}
                      className={`rounded-xl border p-3 text-left transition-smooth ${isActive
                        ? 'border-primary/35 bg-primary/10 shadow-[0_0_14px_hsl(var(--primary)/0.18)]'
                        : 'border-border bg-background/35 hover:border-primary/25'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-display text-sm font-bold leading-snug">
                          {categoryName(category.category_slug, category.audience_slug, t)}
                        </span>
                        {isActive && <Check className="h-4 w-4 shrink-0 text-neon-cyan" />}
                      </div>
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          <Tag className="h-2.5 w-2.5" />
                          {formatLabel(category.format_slug, t)}
                        </span>
                      </div>
                      <div className={`mt-2 break-words font-display text-lg font-black leading-tight sm:text-xl ${isActive ? 'text-primary-glow' : 'text-foreground'}`}>
                        {catFee}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {selectedCategory ? (
            <section className="rounded-[2rem] border border-border bg-gradient-card p-5 shadow-card sm:p-6">
              <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {playersPerTeam === 1 ? 'Jogador' : 'Equipe'}
              </div>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    Jogador 1
                  </div>
                  <div className="flex h-16 items-center gap-3 rounded-xl border border-neon-cyan/25 bg-neon-cyan/5 px-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground">
                      <UserCircle className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-foreground">{currentUser.name}</div>
                      <div className="text-xs text-neon-cyan">{t('youAsPlayer')}</div>
                    </div>
                    <Check className="h-5 w-5 shrink-0 text-neon-cyan" />
                  </div>
                </div>

                {requiredAdditionalPlayers > 0 && (
                  <div>
                    <div className="space-y-3">
                      {Array.from({ length: requiredAdditionalPlayers }).map((_, index) => {
                        const player = selectedPlayers[index];
                        return (
                          <div key={index}>
                            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                              {`Jogador ${index + 2}`}
                            </div>
                            {player ? (
                              <div className="flex h-16 items-center gap-3 rounded-xl border border-neon-pink/25 bg-neon-pink/5 px-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neon-pink/30 bg-neon-pink/10 text-xs font-bold text-neon-pink">
                                  {player.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="font-semibold text-foreground">{player.name}</div>
                                  <div className="text-xs text-muted-foreground">{player.email}</div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setSelectedPlayers((prev) => prev.filter((_, currentIndex) => currentIndex !== index))}
                                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-secondary/60 text-muted-foreground transition-smooth hover:text-foreground"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="rounded-xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
                                Selecione um jogador abaixo
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder={t('searchPlayers')}
                          className="border-border bg-background/60 pl-9 text-sm"
                        />
                      </div>
                      <div className="max-h-52 overflow-y-auto rounded-xl border border-border bg-background/25">
                        {isLoadingPlayers ? (
                          <div className="px-4 py-3 text-xs text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : searchResults.length === 0 ? (
                          <div className="px-4 py-3 text-xs text-muted-foreground">
                            Nenhum jogador encontrado
                          </div>
                        ) : (
                          <div className="divide-y divide-border/50">
                            {searchResults.map((player) => (
                              <button
                                key={player.id}
                                type="button"
                                onClick={() => {
                                  if (selectedPlayers.length >= requiredAdditionalPlayers) return;
                                  setSelectedPlayers((prev) => [...prev, player]);
                                }}
                                className="flex h-14 w-full items-center gap-3 px-4 text-left transition-smooth hover:bg-secondary/40"
                              >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-secondary/60 text-[10px] font-bold">
                                  {player.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-semibold text-foreground">{player.name}</div>
                                  <div className="text-xs text-muted-foreground">{player.level ? t(player.level) : player.email}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          ) : null}
        </div>

        <aside>
          <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
            <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {t('bookingSummary')}
            </div>

            {selectedCategory ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-background/30 p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('championships')}</div>
                  <div className="mt-1 font-semibold text-foreground">{championship.name}</div>
                </div>
                <div className="rounded-xl border border-border bg-background/30 p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('category')}</div>
                  <div className="mt-1 font-semibold text-foreground">{categoryName(selectedCategory.category_slug, selectedCategory.audience_slug, t)}</div>
                </div>
                <div className="rounded-xl border border-border bg-background/30 p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Formato</div>
                  <div className="mt-1 font-semibold text-foreground">{formatLabel(selectedCategory.format_slug, t)}</div>
                </div>
                <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('entryFee')}</div>
                  <div className="mt-1 break-words font-display text-xl font-black leading-tight text-primary-glow sm:text-2xl">{formattedFee}</div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('selectCategoryHint')}</p>
            )}

            <div className="mt-5">
              <button
                type="button"
                disabled={!canProceed || championship.status !== 'open' || isSubmitting}
                onClick={handleProceed}
                className="inline-flex w-full items-center justify-center rounded-lg bg-gradient-primary px-4 py-3 font-display text-sm font-bold uppercase tracking-[0.2em] shadow-neon transition-smooth hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('continue')}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ChampionshipRegistration;
