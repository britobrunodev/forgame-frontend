import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Search, Tag, UserCircle, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SportIcon } from '@/components/SportIcon';
import { CHAMPIONSHIPS } from '@/data/mock';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import { getManagedPlayers } from '@/lib/managed-players-store';
import type { ChampionshipCategory, ManagedPlayer } from '@/types';

const formatLabel = (format: ChampionshipCategory['format'], t: (key: string) => string) => {
  if (format === 'cumbuca') return t('cumbucaFormat');
  if (format === 'rei-da-praia') return t('reiDaPraia');
  return t('doublesFormat');
};

const ChampionshipRegistration = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language, sportName } = useLanguage();
  const { currentUser } = useSession();

  const championship = CHAMPIONSHIPS.find((c) => c.id === id);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [partner, setPartner] = useState<ManagedPlayer | null>(null);
  const [search, setSearch] = useState('');

  if (!championship) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <p className="text-sm text-muted-foreground">{t('championshipNotFound')}</p>
        </div>
      </div>
    );
  }

  const categories = championship.categories ?? [];
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) ?? null;
  const isSingles = selectedCategory?.format === 'cumbuca' || selectedCategory?.format === 'rei-da-praia';

  const allPlayers = getManagedPlayers();
  const searchResults = search.trim()
    ? allPlayers.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()))
    : allPlayers;

  const formattedFee = selectedCategory
    ? new Intl.NumberFormat(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
      style: 'currency',
      currency: 'BRL',
    }).format(selectedCategory.entryFee)
    : null;

  const canProceed = selectedCategory !== null && (isSingles || partner !== null);

  const handleProceed = () => {
    if (!selectedCategory || !formattedFee) return;
    const teamName = isSingles
      ? currentUser.name
      : `${currentUser.name.split(' ')[0]} & ${partner!.name.split(' ')[0]}`;
    navigate('/payment', {
      state: {
        description: `${t('registrationFor')} ${championship.name}`,
        amount: formattedFee,
        backTo: `/championships/${id}/register`,
        complexId: championship.complexId,
        summary: [
          { label: t('championships'), value: championship.name },
          { label: t('category'), value: selectedCategory.name },
          { label: isSingles ? 'Jogador' : 'Dupla', value: teamName },
          { label: t('entryFee'), value: formattedFee },
          { label: 'Formato', value: formatLabel(selectedCategory.format, t) },
        ],
      },
    });
  };

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
            <SportIcon sportId={championship.sport} className="h-7 w-7 text-neon-cyan" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">{sportName(championship.sport)}</p>
            <h1 className="mt-1 font-display text-2xl font-black text-foreground sm:text-3xl">{championship.name}</h1>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          {/* Category selection */}
          <section className="rounded-[2rem] border border-border bg-gradient-card p-5 shadow-card sm:p-6">
            <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {t('selectCategory')}
            </div>
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('noCategoriesYet')}</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {categories.map((category) => {
                  const isActive = selectedCategoryId === category.id;
                  const catFee = new Intl.NumberFormat(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(category.entryFee);
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategoryId(category.id);
                        setPartner(null);
                        setSearch('');
                      }}
                      className={`rounded-2xl border p-4 text-left transition-smooth ${isActive
                          ? 'border-primary/35 bg-primary/10 shadow-[0_0_14px_hsl(var(--primary)/0.18)]'
                          : 'border-border bg-background/35 hover:border-primary/25'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-display text-base font-bold">{category.name}</span>
                        {isActive && <Check className="h-4 w-4 shrink-0 text-neon-cyan" />}
                      </div>
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          <Tag className="h-2.5 w-2.5" />
                          {formatLabel(category.format, t)}
                        </span>
                      </div>
                      <div className={`mt-3 font-display text-2xl font-black ${isActive ? 'text-primary-glow' : 'text-foreground'}`}>
                        {catFee}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Player selection */}
          {selectedCategory ? (
            <section className="rounded-[2rem] border border-border bg-gradient-card p-5 shadow-card sm:p-6">
              <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {isSingles ? 'Jogador' : 'Dupla'}
              </div>
              <div className="space-y-4">
                {/* Player 1 — you */}
                <div>
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    {isSingles ? 'Jogador' : 'Jogador 1'}
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

                {/* Player 2 — doubles only */}
                {!isSingles && (
                  <div>
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      Jogador 2
                    </div>
                    {partner ? (
                      <div className="flex h-16 items-center gap-3 rounded-xl border border-neon-pink/25 bg-neon-pink/5 px-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neon-pink/30 bg-neon-pink/10 text-xs font-bold text-neon-pink">
                          {partner.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-foreground">{partner.name}</div>
                          <div className="text-xs text-muted-foreground">{partner.email}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPartner(null)}
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-secondary/60 text-muted-foreground transition-smooth hover:text-foreground"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
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
                          {searchResults.length === 0 ? (
                            <div className="px-4 py-3 text-xs text-muted-foreground">
                              Nenhum jogador encontrado
                            </div>
                          ) : (
                            <div className="divide-y divide-border/50">
                              {searchResults.map((player) => (
                                <button
                                  key={player.id}
                                  type="button"
                                  onClick={() => setPartner(player)}
                                  className="flex h-14 w-full items-center gap-3 px-4 text-left transition-smooth hover:bg-secondary/40"
                                >
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-secondary/60 text-[10px] font-bold">
                                    {player.name.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-sm font-semibold text-foreground">{player.name}</div>
                                    <div className="text-xs text-muted-foreground">{t(player.level)}</div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          ) : null}
        </div>

        {/* Summary sidebar */}
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
                  <div className="mt-1 font-semibold text-foreground">{selectedCategory.name}</div>
                </div>
                <div className="rounded-xl border border-border bg-background/30 p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Formato</div>
                  <div className="mt-1 font-semibold text-foreground">{formatLabel(selectedCategory.format, t)}</div>
                </div>
                <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('entryFee')}</div>
                  <div className="mt-1 font-display text-2xl font-black text-primary-glow">{formattedFee}</div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('selectCategoryHint')}</p>
            )}

            <div className="mt-5">
              <button
                type="button"
                disabled={!canProceed}
                onClick={handleProceed}
                className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-primary px-4 py-3 font-display text-sm font-bold uppercase tracking-[0.2em] shadow-neon transition-smooth hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t('proceedToPayment')}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ChampionshipRegistration;
