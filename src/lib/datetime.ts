/**
 * Convert a local date+time in a named IANA timezone to a UTC ISO string.
 *
 * Strategy: treat the date+time components as UTC, then measure how far
 * the target timezone is from UTC at that moment, and apply the correction.
 * A second pass handles DST edge cases (fall-back ambiguity).
 */
export function localToUtcIso(dateStr: string, timeStr: string, tz: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);

  // First guess: treat the local time as if it were UTC
  const msGuess = Date.UTC(year, month - 1, day, hour, minute, 0, 0);

  // Find the offset at this UTC moment
  const offsetMs = _tzOffsetMs(new Date(msGuess), tz);

  // Correct the UTC time
  const corrected = new Date(msGuess - offsetMs);

  // Second pass: verify correction is stable (handles DST fall-back edge case)
  const offsetMs2 = _tzOffsetMs(corrected, tz);
  if (offsetMs !== offsetMs2) {
    return new Date(msGuess - offsetMs2).toISOString();
  }

  return corrected.toISOString();
}

/**
 * Convert a UTC ISO string to a local date+time pair in a named IANA timezone.
 * Returns { date: 'YYYY-MM-DD', time: 'HH:00' } (rounds to the hour).
 */
export function utcIsoToLocal(isoStr: string, tz: string): { date: string; time: string } {
  const d = new Date(isoStr);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);

  const p: Record<string, string> = {};
  for (const { type, value } of parts) {
    if (type !== 'literal') p[type] = value;
  }

  // Normalise "24" (some browsers emit 24 for midnight)
  const h = p.hour === '24' ? '00' : p.hour;

  return {
    date: `${p.year}-${p.month}-${p.day}`,
    time: `${h}:00`,
  };
}

/**
 * Format a UTC ISO string as a localised date string (e.g. "01/06/2026").
 * Falls back to '-' when the input is null/undefined.
 */
export function formatUtcDate(
  isoStr: string | null | undefined,
  tz: string | null | undefined,
  locale: string,
): string {
  if (!isoStr) return '-';
  const effectiveTz = tz ?? 'UTC';
  const d = new Date(isoStr);
  return d.toLocaleDateString(locale, {
    timeZone: effectiveTz,
    day: '2-digit',
    month: '2-digit',
  });
}

// ── Private helpers ─────────────────────────────────────────────────────────

/**
 * Return the UTC offset of `tz` at the given UTC Date, in milliseconds.
 * Positive means the timezone is ahead of UTC (e.g. UTC+3 → +10_800_000).
 */
function _tzOffsetMs(utcDate: Date, tz: string): number {
  // Format the same moment in both UTC and the target timezone
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };

  const localParts = new Intl.DateTimeFormat('en-CA', opts).formatToParts(utcDate);
  const lp: Record<string, string> = {};
  for (const { type, value } of localParts) {
    if (type !== 'literal') lp[type] = value;
  }

  const localHour = lp.hour === '24' ? 0 : parseInt(lp.hour, 10);
  const localMs = Date.UTC(
    parseInt(lp.year, 10),
    parseInt(lp.month, 10) - 1,
    parseInt(lp.day, 10),
    localHour,
    parseInt(lp.minute, 10),
    parseInt(lp.second, 10),
  );

  return localMs - utcDate.getTime();
}
