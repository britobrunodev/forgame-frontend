import { useState } from 'react';
import { Clock } from 'lucide-react';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLanguage } from '@/i18n';

interface DateTimePickerProps {
  /** YYYY-MM-DD in the displayed timezone */
  date: string | undefined;
  /** HH:00 (24h hourly) in the displayed timezone */
  time: string;
  onChange: (date: string, time: string) => void;
  placeholder?: string;
  minDate?: Date;
  disabled?: boolean;
}

const HOURLY_TIMES = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const fromDateStr = (s: string) => new Date(`${s}T12:00:00`);

export const DateTimePicker = ({
  date,
  time,
  onChange,
  placeholder = '-',
  minDate,
  disabled = false,
}: DateTimePickerProps) => {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const locale = language === 'pt-BR' ? 'pt-BR' : 'en-US';

  const selected = date ? fromDateStr(date) : undefined;
  const displayDate = selected
    ? selected.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null;

  const displayText = displayDate ? `${displayDate} · ${time}` : placeholder;

  const handleDateSelect = (d: Date | undefined) => {
    if (!d) return;
    onChange(toDateStr(d), time || '09:00');
  };

  const handleTimeSelect = (h: string) => {
    onChange(date ?? toDateStr(new Date()), h);
  };

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={`inline-flex w-full items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2 text-left text-sm font-semibold transition-smooth hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-50 ${
            displayDate ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          <Clock className="h-4 w-4 shrink-0 text-neon-cyan" />
          <span>{displayText}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto border-border bg-popover/95 p-0 backdrop-blur-xl"
        sideOffset={4}
      >
        {/* Calendar */}
        <CalendarPicker
          mode="single"
          selected={selected}
          onSelect={handleDateSelect}
          disabled={minDate ? { before: minDate } : undefined}
          initialFocus
        />

        {/* Time grid */}
        <div className="border-t border-border px-3 pb-3 pt-2.5">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Horário (24h)
          </p>
          <div className="grid grid-cols-6 gap-1">
            {HOURLY_TIMES.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => handleTimeSelect(h)}
                className={`rounded-md px-1 py-1.5 text-[11px] font-bold tabular-nums transition-smooth hover:bg-primary/10 hover:text-primary-glow ${
                  h === time
                    ? 'bg-primary/15 text-primary-glow ring-1 ring-primary/30'
                    : 'text-muted-foreground'
                }`}
              >
                {h.slice(0, 2)}
              </button>
            ))}
          </div>
          {date && (
            <p className="mt-2 text-right text-[10px] text-muted-foreground">
              {displayDate} às {time}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
