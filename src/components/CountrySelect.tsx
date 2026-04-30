import { useMemo, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { COUNTRY_OPTIONS, getCountryLabel } from '@/data/countries';
import type { Language } from '@/i18n';
import { cn } from '@/lib/utils';

type Props = {
  value: string;
  onValueChange: (value: string) => void;
  language: Language;
  className?: string;
  compact?: boolean;
  phoneMode?: boolean;
  placeholder?: string;
  emptyMessage?: string;
};

export const CountrySelect = ({
  value,
  onValueChange,
  language,
  className = '',
  compact = false,
  phoneMode = false,
  placeholder,
  emptyMessage,
}: Props) => {
  const [open, setOpen] = useState(false);
  const selectedCountry = useMemo(
    () => COUNTRY_OPTIONS.find((item) => item.code === value) ?? COUNTRY_OPTIONS[0],
    [value],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'relative w-full border-border bg-background/60 font-semibold text-foreground shadow-none hover:bg-secondary/80 hover:text-foreground',
            compact ? 'h-10 gap-2 px-2.5 pr-8 text-sm' : 'h-10 gap-3 px-3 pr-10 text-sm',
            phoneMode ? 'justify-start' : 'justify-between',
            className,
          )}
        >
          <CountryLabel
            code={selectedCountry.code}
            language={language}
            compact={compact}
            phoneMode={phoneMode}
            placeholder={placeholder}
          />
          <ChevronDown className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] border-border bg-popover/95 p-0 backdrop-blur-xl" align="start">
        <Command className="bg-transparent">
          <CommandInput placeholder={placeholder ?? 'Search country...'} className="h-10" />
          <CommandList>
            <CommandEmpty>{emptyMessage ?? 'No country found.'}</CommandEmpty>
            <CommandGroup>
              {COUNTRY_OPTIONS.map((country) => (
                <CommandItem
                  key={country.code}
                  value={`${country.code} ${country.nameEn} ${country.namePt} ${country.dialCode}`}
                  onSelect={() => {
                    onValueChange(country.code);
                    setOpen(false);
                  }}
                  className="rounded-lg px-3 py-2 text-sm font-semibold"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span className={cn('leading-none', compact ? 'text-sm' : 'text-base')}>{country.flag}</span>
                    <span className="truncate">{language === 'pt-BR' ? country.namePt : country.nameEn}</span>
                    <span className="ml-auto shrink-0 text-xs font-bold uppercase tracking-[0.14em] text-neon-cyan">{country.dialCode}</span>
                  </div>
                  <Check className={cn('ml-2 h-4 w-4', value === country.code ? 'opacity-100' : 'opacity-0')} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const CountryLabel = ({
  code,
  language,
  compact,
  phoneMode,
  placeholder,
}: {
  code: string;
  language: Language;
  compact: boolean;
  phoneMode: boolean;
  placeholder?: string;
}) => {
  const country = COUNTRY_OPTIONS.find((item) => item.code === code);

  if (!country) {
    return <span className="truncate text-muted-foreground">{placeholder ?? ''}</span>;
  }

  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <span className={cn('leading-none', compact ? 'text-sm' : 'text-base')}>{country.flag}</span>
      {phoneMode ? (
        <span className="truncate text-xs font-bold uppercase tracking-[0.14em] text-foreground">{country.dialCode}</span>
      ) : (
        <span className="truncate">{getCountryLabel(code, language)}</span>
      )}
    </span>
  );
};
