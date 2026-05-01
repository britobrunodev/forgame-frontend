import { useEffect, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import type { ClassSlot, PlayerLevel, SportId } from '@/types';

const classStorageKey = 'joga-junto-management-classes';
const todayStr = new Date().toISOString().slice(0, 10);

const exampleClasses: ClassSlot[] = [
    {
        id: 'class-example-1',
        complexId: 'p2',
        complexName: 'FTM Sports Center',
        sport: 'footvolley',
        professorName: 'Rafael Souza',
        date: 'Monday',
        startTime: '08:00',
        endTime: '09:00',
        maxSpots: 10,
        bookedSpots: 3,
        level: 'beginner',
    },
    {
        id: 'class-example-2',
        complexId: 'p2',
        complexName: 'FTM Sports Center',
        sport: 'volleyball',
        professorName: 'Victor Nunes',
        date: 'Wednesday',
        startTime: '10:30',
        endTime: '12:00',
        maxSpots: 12,
        bookedSpots: 6,
        level: 'intermediate',
    },
    {
        id: 'class-example-3',
        complexId: 'p3',
        complexName: 'Contorno da Bola',
        sport: 'beach-soccer',
        professorName: 'João Pedro',
        date: 'Friday',
        startTime: '18:00',
        endTime: '19:00',
        maxSpots: 8,
        bookedSpots: 4,
        level: 'advanced',
    },
];


const ManagementClasses = () => {
    const { t, sportName } = useLanguage();
    const { isGestorMode, currentUser } = useSession();
    const { toast } = useToast();
    const ownedComplexIds = currentUser.ownedComplexIds ?? [];

    const navigate = useNavigate();
    const [createdClasses, setCreatedClasses] = useState<ClassSlot[]>(() => {
        if (typeof window === 'undefined') return exampleClasses;
        try {
            const stored = window.localStorage.getItem(classStorageKey);
            if (stored) {
                const parsed = JSON.parse(stored) as ClassSlot[];
                if (parsed.length > 0) return parsed;
            }
        } catch {
            // ignore invalid storage
        }
        return exampleClasses;
    });
    const [page, setPage] = useState(1);

    const PAGE_SIZE = 8;
    const filteredClasses = createdClasses;
    const totalPages = Math.max(1, Math.ceil(filteredClasses.length / PAGE_SIZE));
    const pagedClasses = filteredClasses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(classStorageKey, JSON.stringify(createdClasses));
    }, [createdClasses]);

    useEffect(() => {
        setPage(1);
    }, [createdClasses]);

    if (!isGestorMode) {
        return (
            <div className="mx-auto w-full max-w-3xl">
                <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
                    <div className="inline-flex items-center gap-2 rounded-full border border-live/30 bg-live/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-live">
                        {t('ownerOnlyTitle')}
                    </div>
                    <h1 className="mt-5 font-display text-4xl font-black">
                        <span className="neon-text">{t('managementClasses')}</span>
                    </h1>
                    <p className="mt-3 max-w-xl text-sm text-muted-foreground">{t('ownerOnlyDescription')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-[min(108rem,calc(100vw-2rem))] space-y-8 xl:max-w-[min(116rem,calc(100vw-3rem))]">
            <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('managementClasses')}</p>
                    <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t('managementClassesIntro')}</p>
                </div>
            </header>

            <div className="rounded-[2rem] border border-border bg-gradient-card p-5 shadow-card sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('managementClasses')}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{t('managementClassesIntro')}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/management/classes/new')}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-secondary/70 text-neon-cyan shadow-neon transition-smooth hover:border-neon-cyan/50 hover:bg-secondary"
                    >
                        <Plus className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-6 overflow-x-auto">
                    {createdClasses.length === 0 ? (
                        <div className="rounded-2xl border border-border bg-background/40 p-8 text-center text-sm text-muted-foreground">
                            <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground/50" />
                            <p className="mt-4">{t('noCreatedClasses')}</p>
                        </div>
                    ) : (
                        <table className="min-w-full text-sm">
                            <thead className="border-b border-border text-left text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3">{t('classes')}</th>
                                    <th className="px-4 py-3">{t('professor')}</th>
                                    <th className="px-4 py-3">{t('weekSchedule')}</th>
                                    <th className="px-4 py-3">{t('reservationStartTime')} / {t('reservationEndTime')}</th>
                                    <th className="px-4 py-3">{t('spotCapacity')}</th>
                                    <th className="px-4 py-3">{t('sportComplex')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {pagedClasses.map((slot) => (
                                    <tr key={slot.id} className="bg-background/80">
                                        <td className="px-4 py-4 align-top">
                                            <div className="font-semibold text-foreground">{sportName(slot.sport)}</div>
                                            <div className="mt-1 text-xs text-muted-foreground">{slot.level ? t(slot.level) : ''}</div>
                                        </td>
                                        <td className="px-4 py-4 align-top text-foreground">{slot.professorName}</td>
                                        <td className="px-4 py-4 align-top text-foreground">{slot.date}</td>
                                        <td className="px-4 py-4 align-top text-foreground">{slot.startTime}–{slot.endTime}</td>
                                        <td className="px-4 py-4 align-top text-foreground">{slot.maxSpots}</td>
                                        <td className="px-4 py-4 align-top text-foreground">{slot.complexName}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {filteredClasses.length > 0 ? (
                    <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{filteredClasses.length} · {page}/{totalPages}</span>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={page === 1}
                                onClick={() => setPage((p) => p - 1)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/60 transition-smooth disabled:opacity-40 hover:border-primary/40 hover:bg-secondary"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                disabled={page === totalPages}
                                onClick={() => setPage((p) => p + 1)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/60 transition-smooth disabled:opacity-40 hover:border-primary/40 hover:bg-secondary"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>

        </div>
    );
};

export default ManagementClasses;
