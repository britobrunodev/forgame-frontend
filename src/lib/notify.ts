import { toast } from '@/hooks/use-toast';

export const notify = {
  success: (title: string, description?: string) =>
    toast({ title, description }),

  warning: (title: string, description?: string) =>
    toast({ title, description, variant: 'warning' }),

  error: (title: string, description?: string) =>
    toast({ title, description, variant: 'destructive' }),
};
