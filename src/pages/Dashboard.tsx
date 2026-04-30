import { useMemo, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FRIENDS, SOCIAL_FEED } from '@/data/mock';
import { Heart, MessageCircle, Plus, Send, Sparkles, UserPlus } from 'lucide-react';
import { SportIcon } from '@/components/SportIcon';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';

const Dashboard = () => {
  const { t, sportName } = useLanguage();
  const { currentUser } = useSession();
  const [connectedFriends, setConnectedFriends] = useState<string[]>([]);

  const feedCards = useMemo(
    () =>
      SOCIAL_FEED.map((post, index) => ({
        ...post,
        likes: 124 + index * 37,
      })),
    [],
  );

  const initials = currentUser.name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2);

  return (
    <div className="mx-auto grid max-w-7xl gap-5 xl:grid-cols-[minmax(0,1.55fr)_340px] xl:gap-6">
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-card shadow-card">
          <div className="relative overflow-hidden px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,245,255,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(255,72,126,0.18),transparent_42%)]" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.32em] text-neon-cyan">{t('playerFeed')}</p>
                <h1 className="font-display text-2xl font-black leading-tight sm:text-3xl lg:text-4xl">
                  {t('hey')}, <span className="neon-text">{currentUser.name.split(' ')[0]}</span>
                </h1>
                <p className="mt-3 text-sm text-muted-foreground">{t('playerFeedIntro')}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:min-w-[320px] sm:gap-3">
                <MetricCard label={t('following')} value="128" accent="text-neon-cyan" />
                <MetricCard label={t('activeFriends')} value={String(FRIENDS.length)} accent="text-neon-pink" />
                <MetricCard label={t('profileViews')} value="1.8k" accent="text-primary-glow" />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-border bg-gradient-card p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-neon-cyan" />
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.22em]">{t('stories')}</h2>
          </div>
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 sm:mx-0 sm:gap-4 sm:px-0">
            <StoryCard
              name={currentUser.name.split(' ')[0]}
              handle="@you"
              image={currentUser.avatarUrl}
              fallback={initials}
              isPrimary
            />
            {FRIENDS.map((friend) => (
              <StoryCard
                key={friend.id}
                name={friend.name}
                handle={friend.handle}
                image={friend.image}
                fallback={friend.name.slice(0, 2).toUpperCase()}
              />
            ))}
          </div>
        </section>

        <section className="space-y-4 xl:hidden">
          <div className="rounded-[1.75rem] border border-border bg-gradient-card p-4 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-neon-pink" />
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.22em]">{t('suggestedFriends')}</h2>
            </div>
            <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
              {FRIENDS.map((friend) => {
                const isAdded = connectedFriends.includes(friend.id);

                return (
                  <div key={friend.id} className="min-w-[220px] rounded-2xl border border-border bg-background/35 p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border border-primary/15">
                        <AvatarImage src={friend.image} alt={friend.name} />
                        <AvatarFallback className="bg-gradient-primary font-display text-xs font-bold text-primary-foreground">
                          {friend.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-foreground">{friend.name}</div>
                        <div className="truncate text-xs text-muted-foreground">{friend.status}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (isAdded) return;
                        setConnectedFriends((current) => [...current, friend.id]);
                      }}
                      className={`mt-3 w-full rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition-smooth ${
                        isAdded
                          ? 'border border-primary/20 bg-primary/10 text-primary-glow'
                          : 'border border-border bg-secondary text-foreground hover:border-primary/40'
                      }`}
                    >
                      {isAdded ? t('following') : t('addFriend')}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-border bg-gradient-card p-4 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-neon-cyan" />
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.22em]">{t('communityHighlights')}</h2>
            </div>
            <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
              {FRIENDS.map((friend) => (
                <div key={friend.id} className="flex min-w-[220px] items-center gap-3 rounded-2xl border border-border bg-background/35 p-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                    <SportIcon sportId={friend.sport} className="h-5 w-5 text-primary-glow" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold">{friend.name}</div>
                    <div className="text-xs text-muted-foreground">{sportName(friend.sport)} · {friend.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-5">
          {feedCards.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-[1.75rem] border border-border bg-gradient-card shadow-card">
              <div className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-5">
                <Avatar className="h-11 w-11 border border-primary/20">
                  <AvatarImage src={post.image} alt={post.author} />
                  <AvatarFallback className="bg-gradient-primary font-display text-xs font-bold text-primary-foreground">
                    {post.author.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-foreground">{post.author}</div>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-neon-cyan">{post.role}</div>
                </div>
                <button className="w-full rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-glow transition-smooth hover:border-primary/50 sm:w-auto">
                  {t('socialPulse')}
                </button>
              </div>

              <div className="relative h-72 overflow-hidden bg-secondary sm:h-[340px]">
                <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/15 to-transparent" />
              </div>

              <div className="px-4 py-5 sm:px-5">
                <div className="mb-3 flex flex-wrap items-center gap-4 text-muted-foreground">
                  <button className="inline-flex items-center gap-2 transition-smooth hover:text-neon-pink">
                    <Heart className="h-4 w-4" />
                    <span className="text-sm font-semibold">{post.likes}</span>
                  </button>
                  <button className="inline-flex items-center gap-2 transition-smooth hover:text-neon-cyan">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm font-semibold">{post.metricB}</span>
                  </button>
                  <button className="inline-flex items-center gap-2 transition-smooth hover:text-primary-glow">
                    <Send className="h-4 w-4" />
                    <span className="text-sm font-semibold">{post.metricA}</span>
                  </button>
                </div>
                <h3 className="font-display text-xl font-black leading-tight sm:text-2xl">{post.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{post.body}</p>
              </div>
            </article>
          ))}
        </section>
      </div>

      <aside className="hidden space-y-6 xl:block">
        <section className="rounded-[1.75rem] border border-border bg-gradient-card p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-neon-pink" />
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.22em]">{t('suggestedFriends')}</h2>
          </div>
          <div className="space-y-3">
            {FRIENDS.map((friend) => {
              const isAdded = connectedFriends.includes(friend.id);

              return (
                <div key={friend.id} className="rounded-2xl border border-border bg-background/35 p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border border-primary/15">
                      <AvatarImage src={friend.image} alt={friend.name} />
                      <AvatarFallback className="bg-gradient-primary font-display text-xs font-bold text-primary-foreground">
                        {friend.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-foreground">{friend.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{friend.status}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (isAdded) return;
                        setConnectedFriends((current) => [...current, friend.id]);
                      }}
                      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] transition-smooth ${
                        isAdded
                          ? 'border border-primary/20 bg-primary/10 text-primary-glow'
                          : 'border border-border bg-secondary text-foreground hover:border-primary/40'
                      }`}
                    >
                      {isAdded ? t('following') : t('addFriend')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-border bg-gradient-card p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-neon-cyan" />
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.22em]">{t('communityHighlights')}</h2>
          </div>
          <div className="space-y-3">
            {FRIENDS.map((friend) => (
              <div key={friend.id} className="flex items-center gap-3 rounded-2xl border border-border bg-background/35 p-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                  <SportIcon sportId={friend.sport} className="h-5 w-5 text-primary-glow" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold">{friend.name}</div>
                  <div className="text-xs text-muted-foreground">{sportName(friend.sport)} · {friend.status}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
};

const MetricCard = ({ label, value, accent }: { label: string; value: string; accent: string }) => (
  <div className="rounded-2xl border border-border bg-background/35 p-2.5 sm:p-3">
    <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground sm:text-[10px] sm:tracking-[0.2em]">{label}</div>
    <div className={`mt-1.5 font-display text-lg font-black sm:mt-2 sm:text-2xl ${accent}`}>{value}</div>
  </div>
);

const StoryCard = ({
  name,
  handle,
  image,
  fallback,
  isPrimary = false,
}: {
  name: string;
  handle: string;
  image?: string;
  fallback: string;
  isPrimary?: boolean;
}) => (
  <button
    type="button"
    className="group flex min-w-[78px] flex-col items-center gap-2 rounded-[1.4rem] border border-border bg-background/30 px-2 py-3 transition-smooth hover:border-primary/40 hover:bg-background/45 sm:min-w-[92px] sm:px-3 sm:py-4"
  >
    <div className="relative">
      <div className="rounded-full bg-[conic-gradient(from_140deg,_rgba(255,72,126,0.9),_rgba(0,245,255,0.95),_rgba(255,72,126,0.9))] p-[2px]">
        <Avatar className="h-14 w-14 border-2 border-background sm:h-16 sm:w-16">
          <AvatarImage src={image} alt={name} className={isPrimary ? 'object-cover' : undefined} />
          <AvatarFallback className="bg-gradient-primary font-display text-sm font-bold text-primary-foreground">
            {fallback}
          </AvatarFallback>
        </Avatar>
      </div>
      {isPrimary ? (
        <span className="absolute -bottom-1 -right-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-background bg-primary text-primary-foreground">
          <Plus className="h-3.5 w-3.5" />
        </span>
      ) : null}
    </div>
    <div className="text-center">
      <div className="text-xs font-semibold sm:text-sm">{name}</div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{handle}</div>
    </div>
  </button>
);

export default Dashboard;
