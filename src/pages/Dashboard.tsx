import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FRIENDS, SOCIAL_FEED } from '@/data/mock';
import { Heart, MessageCircle, Send, Sparkles, Trophy, UserPlus } from 'lucide-react';
import { SportIcon } from '@/components/SportIcon';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';

const levelColors: Record<string, string> = {
  beginner: 'border-muted-foreground/40 bg-muted-foreground/10 text-muted-foreground',
  intermediate: 'border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan',
  advanced: 'border-neon-pink/40 bg-neon-pink/10 text-neon-pink',
  silver: 'border-primary/40 bg-primary/10 text-primary-glow',
  gold: 'border-yellow-400/50 bg-yellow-400/10 text-yellow-300',
  professional: 'border-live/40 bg-live/10 text-live',
};

const Dashboard = () => {
  const { t, sportName } = useLanguage();
  const { currentUser } = useSession();
  const navigate = useNavigate();
  const [connectedFriends, setConnectedFriends] = useState<string[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);

  const feedCards = useMemo(
    () => SOCIAL_FEED.map((post, index) => ({ ...post, likes: 124 + index * 37 })),
    [],
  );

  const initials = currentUser.name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2);

  const levelColor = levelColors[currentUser.level ?? 'beginner'] ?? levelColors.beginner;

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_340px] xl:gap-6">

        {/* ── Main column ── */}
        <div className="min-w-0 space-y-5">

          {/* Player card */}
          <section className="overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-card shadow-card">
            <div className="relative px-4 py-5 sm:px-6 sm:py-7">
              {/* Neon glow bg */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,245,255,0.14),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(255,72,126,0.14),transparent_40%)]" />

              {/* Avatar + name row */}
              <div className="relative flex items-center gap-4">
                <div className="shrink-0">
                  <div className="rounded-full bg-[conic-gradient(from_140deg,_rgba(255,72,126,0.9),_rgba(0,245,255,0.95),_rgba(255,72,126,0.9))] p-[2.5px]">
                    <Avatar className="h-16 w-16 border-2 border-background sm:h-20 sm:w-20">
                      <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} className="object-cover" />
                      <AvatarFallback className="bg-gradient-primary font-display text-base font-bold text-primary-foreground sm:text-xl">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('playerFeed')}</p>
                  <h1 className="mt-0.5 truncate font-display text-xl font-black leading-tight sm:text-2xl">
                    {t('hey')}, <span className="neon-text">{currentUser.name.split(' ')[0]}</span>
                  </h1>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {currentUser.level && (
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${levelColor}`}>
                        <Trophy className="h-2.5 w-2.5" />
                        {t(currentUser.level)}
                      </span>
                    )}
                    {(currentUser.preferences ?? []).map((sportId) => (
                      <span key={sportId} className="inline-flex items-center gap-1 rounded-full border border-border bg-background/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                        <SportIcon sportId={sportId} className="h-2.5 w-2.5" />
                        {sportName(sportId)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="relative mt-4 grid grid-cols-3 gap-2">
                <StatBlock label={t('wins')} value={String(currentUser.wins ?? 0)} accent="text-neon-cyan" />
                <StatBlock label={t('draws')} value={String(currentUser.draws ?? 0)} accent="text-primary-glow" />
                <StatBlock label={t('losses')} value={String(currentUser.losses ?? 0)} accent="text-neon-pink" />
              </div>
            </div>
          </section>

          {/* Quick actions */}
          <section className="grid grid-cols-4 gap-2 sm:gap-3">
            <QuickAction icon={<Trophy className="h-4 w-4 text-neon-cyan sm:h-5 sm:w-5" />} label={t('championships')} onClick={() => navigate('/championships')} />
            <QuickAction icon={<SportIcon sportId="footvolley" className="h-4 w-4 text-neon-pink sm:h-5 sm:w-5" />} label={t('reserve')} onClick={() => navigate('/reservations')} />
            <QuickAction icon={<SportIcon sportId="beach-tennis" className="h-4 w-4 text-primary-glow sm:h-5 sm:w-5" />} label={t('managementClasses')} onClick={() => navigate('/reservations/classes')} />
            <QuickAction icon={<Sparkles className="h-4 w-4 text-yellow-400 sm:h-5 sm:w-5" />} label={t('mySchedule')} onClick={() => navigate('/schedule')} />
          </section>

          {/* Friends — mobile/tablet horizontal scroll (hidden on xl where sidebar exists) */}
          <section className="xl:hidden">
            <div className="mb-3 flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-neon-pink" />
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.22em]">{t('suggestedFriends')}</h2>
            </div>
            {/* Overflow container: clip the scroll bar to avoid page-wide horizontal scroll */}
            <div className="overflow-hidden">
              <div className="flex gap-3 overflow-x-auto pb-2">
                {FRIENDS.map((friend) => {
                  const isAdded = connectedFriends.includes(friend.id);
                  return (
                    <div key={friend.id} className="flex w-36 shrink-0 flex-col items-center gap-2 rounded-2xl border border-border bg-gradient-card p-3 text-center sm:w-40">
                      <Avatar className="h-11 w-11 border border-primary/15">
                        <AvatarImage src={friend.image} alt={friend.name} />
                        <AvatarFallback className="bg-gradient-primary font-display text-xs font-bold text-primary-foreground">
                          {friend.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="w-full min-w-0">
                        <div className="truncate text-sm font-semibold text-foreground">{friend.name}</div>
                        <div className="truncate text-[10px] text-muted-foreground">{friend.status}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { if (!isAdded) setConnectedFriends((c) => [...c, friend.id]); }}
                        className={`w-full rounded-full px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-smooth ${
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
          </section>

          {/* Feed */}
          <section className="space-y-4">
            {feedCards.map((post) => {
              const isLiked = likedPosts.includes(post.id);
              return (
                <article key={post.id} className="overflow-hidden rounded-[1.75rem] border border-border bg-gradient-card shadow-card">
                  <div className="flex items-center gap-3 px-4 py-3 sm:px-5">
                    <Avatar className="h-9 w-9 shrink-0 border border-primary/20">
                      <AvatarImage src={post.image} alt={post.author} />
                      <AvatarFallback className="bg-gradient-primary font-display text-xs font-bold text-primary-foreground">
                        {post.author.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-foreground">{post.author}</div>
                      <div className="text-[10px] uppercase tracking-[0.22em] text-neon-cyan">{post.role}</div>
                    </div>
                  </div>

                  <div className="relative h-44 overflow-hidden bg-secondary sm:h-64">
                    <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/5 to-transparent" />
                  </div>

                  <div className="px-4 py-3 sm:px-5 sm:py-4">
                    <h3 className="font-display text-base font-black leading-tight sm:text-lg">{post.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{post.body}</p>
                    <div className="mt-3 flex items-center gap-4 text-muted-foreground">
                      <button
                        type="button"
                        onClick={() => setLikedPosts((c) => isLiked ? c.filter((postId) => postId !== post.id) : [...c, post.id])}
                        className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-smooth ${isLiked ? 'text-neon-pink' : 'hover:text-neon-pink'}`}
                      >
                        <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                        {post.likes + (isLiked ? 1 : 0)}
                      </button>
                      <button type="button" className="inline-flex items-center gap-1.5 text-sm font-semibold transition-smooth hover:text-neon-cyan">
                        <MessageCircle className="h-4 w-4" />
                        {post.metricB}
                      </button>
                      <button type="button" className="inline-flex items-center gap-1.5 text-sm font-semibold transition-smooth hover:text-primary-glow">
                        <Send className="h-4 w-4" />
                        {post.metricA}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        </div>

        {/* ── Desktop sidebar (xl only) ── */}
        <aside className="hidden space-y-5 xl:block">
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
                      <Avatar className="h-11 w-11 shrink-0 border border-primary/15">
                        <AvatarImage src={friend.image} alt={friend.name} />
                        <AvatarFallback className="bg-gradient-primary font-display text-xs font-bold text-primary-foreground">
                          {friend.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-foreground">{friend.name}</div>
                        <div className="truncate text-xs text-muted-foreground">{friend.status}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { if (!isAdded) setConnectedFriends((c) => [...c, friend.id]); }}
                        className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] transition-smooth ${
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
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                    <SportIcon sportId={friend.sport} className="h-5 w-5 text-primary-glow" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{friend.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{sportName(friend.sport)} · {friend.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

const StatBlock = ({ label, value, accent }: { label: string; value: string; accent: string }) => (
  <div className="rounded-xl border border-border bg-background/35 p-2 text-center sm:rounded-2xl sm:p-3">
    <div className={`font-display text-xl font-black sm:text-2xl ${accent}`}>{value}</div>
    <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground sm:text-[10px]">{label}</div>
  </div>
);

const QuickAction = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-gradient-card p-2.5 text-center transition-smooth hover:border-primary/30 hover:bg-secondary/60 sm:gap-2 sm:p-3"
  >
    <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-background/40 sm:h-10 sm:w-10">
      {icon}
    </div>
    <span className="line-clamp-2 text-[9px] font-bold uppercase leading-tight tracking-[0.1em] text-muted-foreground sm:text-[10px] sm:tracking-[0.15em]">{label}</span>
  </button>
);

export default Dashboard;
