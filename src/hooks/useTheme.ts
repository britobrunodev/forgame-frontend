import { useCallback, useEffect } from 'react';
import { useSession } from '@/session';
import { usersApi } from '@/lib/api';
import type { Theme } from '@/types';

export type { Theme };

function applyTheme(theme: Theme) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
  document.documentElement.classList.toggle('dark', isDark);
}

export function useTheme() {
  const { currentUser, updateCurrentUser, token } = useSession();
  const theme: Theme = currentUser.theme ?? 'system';

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Keep in sync when system preference changes and theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback(
    async (next: Theme) => {
      updateCurrentUser({ theme: next });
      applyTheme(next);
      if (token) {
        usersApi.updateTheme(token, next).catch(() => {});
      }
    },
    [token, updateCurrentUser],
  );

  return { theme, setTheme };
}
