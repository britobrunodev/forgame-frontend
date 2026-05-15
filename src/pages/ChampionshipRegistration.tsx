import { useEffect, useMemo, useState, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, ChevronRight, Loader2, Search, UserCircle, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import { championshipApi, championshipFormatsApi, championshipSubscriptionsApi, usersApi } from '@/lib/api';
import { notify } from '@/lib/notify';
import type { SportId } from '@/types';

type EditSubscriptionState = {
  subscriptionId: number;
  categoryId: number;
  playerIds: number[];
};

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
  const location = useLocation();
  const editState = (location.state as { editSubscription?: EditSubscriptionState } | null)?.editSubscription ?? null;
  const { t, language, sportName } = useLanguage();
  const { currentUser, token } = useSession();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    editState ? String(editState.categoryId) : null,
  );
  const [selectedPlayers, setSelectedPlayers] = useState<Array<{ id: number; name: string; nickname: string | null; email: string; level: string | null; gender: string | null }>>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 400);
  };
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

  const { data: formats = [] } = useQuery({
    queryKey: ['championship-formats', championship?.sport_id],
    queryFn: () => championshipFormatsApi.list(token!, championship!.sport_id ?? undefined),
    enabled: !!token && !!championship,
  });

  const sport = useMemo(() => {
    if (!championship?.sport_id) return null;
    const sportRecord = sports.find((item) => item.id === championship.sport_id);
    return mapSportSlug(sportRecord?.slug);
  }, [championship, sports]);

  const categories = championship?.categories ?? [];
  const selectedCategory = categories.find((category) => String(category.id) === selectedCategoryId) ?? null;

  // Resolve format config to determine how many players subscribe together
  const selectedFormat = useMemo(
    () => formats.find((f) => f.id === selectedCategory?.format_id) ?? null,
    [formats, selectedCategory],
  );
  const rawSubscriptionPlayers = selectedFormat?.config_json?.subscription_players;
  const subscriptionPlayers =
    typeof rawSubscriptionPlayers === 'number' && rawSubscriptionPlayers > 0
      ? rawSubscriptionPlayers
      : typeof rawSubscriptionPlayers === 'string' && /^\d+$/.test(rawSubscriptionPlayers) && Number(rawSubscriptionPlayers) > 0
        ? Number(rawSubscriptionPlayers)
        : 1;
  const requiredAdditionalPlayers = Math.max(0, subscriptionPlayers - 1);

  const { data: playersResponse, isLoading: isLoadingPlayers } = useQuery({
    queryKey: ['championship-registration-players', debouncedSearch, genderFilter],
    queryFn: () => usersApi.listPlayers(token!, 1, 20, debouncedSearch, genderFilter),
    enabled: !!token && !!selectedCategoryId && requiredAdditionalPlayers > 0,
  });

  const searchResults = useMemo(
    () => (playersResponse?.items ?? []).filter(
      (player) => !selectedPlayers.some((selected) => selected.id === player.id),
    ),
    [playersResponse, selectedPlayers],
  );

  // Pre-fill partner players when entering edit mode
  useEffect(() => {
    if (!editState || !playersResponse || selectedPlayers.length > 0) return;
    const partnerIds = editState.playerIds.filter((pid) => pid !== Number(currentUser.id));
    if (partnerIds.length === 0) return;
    const partners = partnerIds
      .map((pid) => playersResponse.items.find((p) => p.id === pid))
      .filter(Boolean) as typeof selectedPlayers;
    if (partners.length > 0) setSelectedPlayers(partners);
  }, [editState, playersResponse]); // eslint-disable-line react-hooks/exhaustive-deps

  const formattedFee = selectedCategory
    ? new Intl.NumberFormat(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
      style: 'currency',
      currency: 'BRL',
    }).format(selectedCategory.entry_fee ?? 0)
    : null;

  const canProceed = selectedCategory !== null
    && !selectedCategory.is_full
    && selectedPlayers.length === requiredAdditionalPlayers;

  const handleProceed = () => {
    if (!championship || !selectedCategory || !formattedFee || !token) return;
    if (selectedCategory.is_full) {
      notify.error(t('categoryFull'), t('categoryFullDescription'));
      return;
    }
    const playerIds =
      subscriptionPlayers === 1
        ? [Number(currentUser.id)]
        : [Number(currentUser.id), ...selectedPlayers.map((player) => player.id)];
    const teamName = [currentUser.name, ...selectedPlayers.map((player) => player.name)]
      .map((name) => name.split(' ')[0])
      .join(' & ');

    const goToPayment = (paymentId: number, paymentStatus: string, totalAmount: number, resolvedSubscriptionId: number) => {
      const formattedAmount = new Intl.NumberFormat(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
        style: 'currency',
        currency: 'BRL',
      }).format(totalAmount ?? 0);
      const backToState: Record<string, unknown> = {
        editSubscription: {
          subscriptionId: resolvedSubscriptionId,
          categoryId: selectedCategory.id,
          playerIds,
        },
      };
      navigate(`/payment/${paymentId}`, {
        state: {
          paymentId,
          title: t('championshipRegistrations'),
          description: `${t('registrationFor')} ${championship.name}`,
          amount: formattedAmount,
          backTo: `/dashboard`,
          backToState,
          complexId: championship.complex_id != null ? String(championship.complex_id) : undefined,
          summary: [
            { label: t('championships'), value: championship.name },
            { label: t('category'), value: categoryName(selectedCategory.category_slug, selectedCategory.audience_slug, t) },
            { label: subscriptionPlayers === 1 ? 'Jogador' : 'Equipe', value: teamName },
            { label: t('entryFee'), value: formattedAmount },
            { label: 'Formato', value: formatLabel(selectedCategory.format_slug, t) },
            { label: 'Status', value: paymentStatus },
          ],
        },
      });
    };

    const handleCheckoutResponse = (
      subscription: {
        payment_id: number | null;
        payment_status: string | null;
        total_amount: number | null;
        subscription_status: string;
        subscription_ids: number[];
      },
      resolvedSubscriptionId: number,
    ) => {
      if (
        subscription.subscription_status === 'waiting_approval' ||
        subscription.payment_id == null ||
        subscription.payment_status == null ||
        subscription.total_amount == null
      ) {
        notify.success(t('registrationPendingApproval'), t('registrationPendingApprovalDescription'));
        navigate('/bookings');
        return;
      }
      goToPayment(
        subscription.payment_id,
        subscription.payment_status,
        subscription.total_amount,
        resolvedSubscriptionId,
      );
    };

    setIsSubmitting(true);

    if (editState) {
      championshipSubscriptionsApi.update(token, editState.subscriptionId, {
        category_id: selectedCategory.id!,
        player_ids: playerIds,
      })
        .then((subscription) => handleCheckoutResponse(subscription, editState.subscriptionId))
        .catch((err: unknown) => {
          notify.error(err instanceof Error ? err.message : 'Erro ao atualizar inscrição');
        })
        .finally(() => setIsSubmitting(false));
      return;
    }

    championshipApi.createSubscription(token, championship.id, {
      category_id: selectedCategory.id!,
      player_ids: playerIds,
    })
      .then((subscription) => handleCheckoutResponse(subscription, subscription.subscription_ids[0]))
      .catch((err: unknown) => {
        if (err instanceof Error && err.message.includes('Já possui inscrição')) {
          notify.error('Já possui inscrição', 'Acesse minha área para finalizar inscrição');
        } else {
          notify.error(err instanceof Error ? err.message : 'Erro ao criar inscrição');
        }
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
          onClick={() => editState ? navigate('/bookings') : navigate('/championships')}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background/60 text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <p className="font-display text-sm font-bold uppercase tracking-[0.28em] text-primary dark:text-[#39E600]">{t('championshipRegistrations')}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{t('registerForChampionship')}</p>
        </div>
      </header>

      <section className="rounded-[2rem] border border-border bg-gradient-card p-6 shadow-card sm:p-8">
        <p className="font-display text-[10px] font-bold uppercase tracking-[0.3em] text-primary dark:text-[#39E600]">
          {sport ? sportName(sport) : t('championships')}
        </p>
        <h1 className="mt-1 font-display text-2xl font-black leading-tight text-muted-foreground dark:text-foreground sm:text-3xl">{championship.name}</h1>
      </section>

      {championship.status !== 'open' ? (
        <section className="rounded-[2rem] border border-border bg-gradient-card p-5 shadow-card sm:p-6">
          <p className="text-sm text-muted-foreground">{t('closedRegistrationsDescription')}</p>
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-border bg-gradient-card p-5 shadow-card sm:p-6">
            <p className="mb-5 font-display text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
              {t('selectCategory')}
            </p>
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('noCategoriesYet')}</p>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => {
                  const isActive = selectedCategoryId === String(category.id);
                  const isFull = category.is_full;
                  const catFee = new Intl.NumberFormat(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(category.entry_fee ?? 0);
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        if (isFull) {
                          notify.error(t('categoryFull'), t('categoryFullDescription'));
                          return;
                        }
                        setSelectedCategoryId(String(category.id));
                        setSelectedPlayers([]);
                        setSearch('');
                        setDebouncedSearch('');
                        setGenderFilter('');
                      }}
                      className={`group flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-smooth ${
                        isActive
                          ? 'border-primary/40 bg-primary/10 shadow-[0_0_20px_hsl(var(--primary)/0.18)]'
                          : isFull
                            ? 'border-border bg-background/20 opacity-70'
                            : 'border-border bg-background/30 hover:border-primary/30 hover:bg-background/50'
                      }`}
                    >
                      {/* Selection indicator */}
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-smooth ${
                        isActive
                          ? 'border-primary bg-primary/20'
                          : 'border-border/60 group-hover:border-primary/40'
                      }`}>
                        {isActive && <div className="h-2 w-2 rounded-full bg-primary-glow" />}
                      </div>

                      {/* Name + format */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className={`font-display text-base font-black leading-tight ${isActive ? 'text-primary-glow' : 'text-foreground'}`}>
                            {categoryName(category.category_slug, category.audience_slug, t)}
                          </div>
                          {isFull && (
                            <span className="rounded-full border border-neon-pink/30 bg-neon-pink/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-neon-pink">
                              {t('full')}
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {formatLabel(category.format_slug, t)}
                        </div>
                      </div>

                      {/* Fee */}
                      <div className={`shrink-0 font-display text-xl font-black leading-none ${isActive ? 'text-primary-glow' : 'text-foreground'}`}>
                        {catFee}
                      </div>

                      <ChevronRight className={`h-4 w-4 shrink-0 transition-smooth ${isActive ? 'text-primary-glow' : 'text-muted-foreground/40 group-hover:text-muted-foreground'}`} />
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {selectedCategory ? (
            <section className="rounded-[2rem] border border-border bg-gradient-card p-5 shadow-card sm:p-6">
              {subscriptionPlayers !== 1 && (
                <p className="mb-5 font-display text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
                  Equipe
                </p>
              )}

              {requiredAdditionalPlayers > 0 ? (
                <div className="flex gap-0 sm:gap-0">
                  {/* ── Left: player slots ── */}
                  <div className="w-[45%] shrink-0 space-y-3 pr-4">
                    {/* Jogador 1 — always me */}
                    <div>
                      <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Jogador 1</div>
                      <div className="flex items-center gap-3 rounded-xl border border-neon-cyan/25 bg-neon-cyan/5 px-3 py-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-primary">
                          <UserCircle className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-foreground">{currentUser.nickname ?? currentUser.name}</div>
                          <div className="text-xs text-neon-cyan">{t('youAsPlayer')}</div>
                        </div>
                        <Check className="h-4 w-4 shrink-0 text-neon-cyan" />
                      </div>
                    </div>

                    {/* Additional player slots */}
                    {Array.from({ length: requiredAdditionalPlayers }).map((_, index) => {
                      const player = selectedPlayers[index];
                      return (
                        <div key={index}>
                          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                            {`Jogador ${index + 2}`}
                          </div>
                          {player ? (
                            <div className="flex items-center gap-3 rounded-xl border border-neon-pink/25 bg-neon-pink/5 px-3 py-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neon-pink/30 bg-neon-pink/10 text-[10px] font-bold text-neon-pink">
                                {(player.nickname ?? player.name).slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-semibold text-foreground">{player.nickname ?? player.name}</div>
                                {(player.level || player.gender) && (
                                  <div className="text-xs text-muted-foreground">
                                    {[player.level && t(player.level), player.gender && t(player.gender)].filter(Boolean).join(' · ')}
                                  </div>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedPlayers((prev) => prev.filter((_, i) => i !== index))}
                                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-secondary/60 text-muted-foreground transition-smooth hover:text-foreground"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center rounded-xl border border-dashed border-border px-3 py-2.5">
                              <div className="h-8" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* ── Vertical divider ── */}
                  <div className="w-px shrink-0 self-stretch bg-border/50" />

                  {/* ── Right: search + results ── */}
                  <div className="min-w-0 flex-1 space-y-2 pl-4">
                    <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Buscar jogador</div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder={t('searchPlayers')}
                        className="border-border bg-background/60 pl-8 text-sm"
                      />
                    </div>
                    {/* Gender filter */}
                    <div className="flex gap-1.5">
                      {(['', 'male', 'female'] as const).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGenderFilter(g)}
                          className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] transition-smooth ${
                            genderFilter === g
                              ? 'border-primary/40 bg-primary/15 text-primary-glow'
                              : 'border-border bg-background/40 text-muted-foreground hover:border-primary/25 hover:text-foreground'
                          }`}
                        >
                          {g === '' ? 'Todos' : g === 'male' ? t('male') : t('female')}
                        </button>
                      ))}
                    </div>
                    <div className="h-52 overflow-y-auto rounded-xl border border-border bg-background/25">
                      {isLoadingPlayers ? (
                        <div className="flex items-center px-3 py-3">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="px-3 py-3 text-xs text-muted-foreground">Nenhum jogador encontrado</div>
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
                              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-smooth hover:bg-secondary/40"
                            >
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-secondary/60 text-[9px] font-bold">
                                {(player.nickname ?? player.name).slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-xs font-semibold text-foreground">{player.nickname ?? player.name}</div>
                                {(player.level || player.gender) && (
                                  <div className="text-[10px] text-muted-foreground">
                                    {[player.level && t(player.level), player.gender && t(player.gender)].filter(Boolean).join(' · ')}
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Single player category — just show current user */
                <div className="flex items-center gap-3 rounded-xl border border-neon-cyan/25 bg-neon-cyan/5 px-4 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-primary">
                    <UserCircle className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-foreground">{currentUser.nickname ?? currentUser.name}</div>
                    {currentUser.gender && <div className="text-xs text-muted-foreground">{t(currentUser.gender)}</div>}
                    <div className="text-xs text-neon-cyan">{t('youAsPlayer')}</div>
                  </div>
                  <Check className="h-5 w-5 shrink-0 text-neon-cyan" />
                </div>
              )}
            </section>
          ) : null}
        </div>

        <aside className="h-full">
          <div className="flex h-full flex-col rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
            <p className="mb-5 font-display text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
              {t('bookingSummary')}
            </p>

            <div className="flex-1">
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
                  {selectedCategory.is_full && (
                    <div className="rounded-xl border border-neon-pink/25 bg-neon-pink/10 p-3 text-sm text-neon-pink">
                      <div className="font-semibold">{t('categoryFull')}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{t('categoryFullDescription')}</div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {selectedCategory && (
              <div className="mt-5">
                <button
                  type="button"
                  disabled={!canProceed || championship.status !== 'open' || isSubmitting}
                  onClick={handleProceed}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-gradient-primary px-4 py-3 font-display text-sm font-bold uppercase tracking-[0.2em] text-white shadow-neon transition-smooth hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('continue')}
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ChampionshipRegistration;
