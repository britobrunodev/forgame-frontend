import { useEffect, useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, PlusCircle, Save, Settings2, ShieldCheck, Trash2 } from 'lucide-react';
import { adminSettingsApi, type CategoryData, type PaymentMethodOptionData, type SportData } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { notify } from '@/lib/notify';
import { useSession } from '@/session';

const AdminSettings = () => {
  const { currentUser, token } = useSession();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['admin-settings-categories'],
    queryFn: () => adminSettingsApi.listCategories(token!),
    enabled: !!token && currentUser.isAdmin,
  });
  const { data: sports = [], isLoading: loadingSports } = useQuery({
    queryKey: ['admin-settings-sports'],
    queryFn: () => adminSettingsApi.listSports(token!),
    enabled: !!token && currentUser.isAdmin,
  });
  const { data: paymentMethods = [], isLoading: loadingPaymentMethods } = useQuery({
    queryKey: ['admin-settings-payment-methods'],
    queryFn: () => adminSettingsApi.listPaymentMethods(token!),
    enabled: !!token && currentUser.isAdmin,
  });

  const [categoryDrafts, setCategoryDrafts] = useState<CategoryData[]>([]);
  const [sportDrafts, setSportDrafts] = useState<SportData[]>([]);
  const [paymentMethodDrafts, setPaymentMethodDrafts] = useState<PaymentMethodOptionData[]>([]);

  const [newCategory, setNewCategory] = useState({ slug: '', name: '', sort_order: '0' });
  const [newSport, setNewSport] = useState({ slug: '', name: '' });
  const [newPaymentMethod, setNewPaymentMethod] = useState({ code: '', name: '', is_active: true });

  useEffect(() => setCategoryDrafts(categories), [categories]);
  useEffect(() => setSportDrafts(sports), [sports]);
  useEffect(() => setPaymentMethodDrafts(paymentMethods), [paymentMethods]);

  const refreshAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin-settings-categories'] }),
      queryClient.invalidateQueries({ queryKey: ['admin-settings-sports'] }),
      queryClient.invalidateQueries({ queryKey: ['admin-settings-payment-methods'] }),
      queryClient.invalidateQueries({ queryKey: ['categories'] }),
      queryClient.invalidateQueries({ queryKey: ['championship-sports'] }),
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] }),
    ]);
  };

  const createCategory = useMutation({
    mutationFn: () => adminSettingsApi.createCategory(token!, {
      slug: newCategory.slug,
      name: newCategory.name,
      sort_order: Number(newCategory.sort_order || 0),
    }),
    onSuccess: async () => {
      setNewCategory({ slug: '', name: '', sort_order: '0' });
      await refreshAll();
      notify.success('Categoria criada');
    },
    onError: (error: unknown) => notify.error(error instanceof Error ? error.message : 'Erro ao criar categoria'),
  });

  const createSport = useMutation({
    mutationFn: () => adminSettingsApi.createSport(token!, newSport),
    onSuccess: async () => {
      setNewSport({ slug: '', name: '' });
      await refreshAll();
      notify.success('Esporte criado');
    },
    onError: (error: unknown) => notify.error(error instanceof Error ? error.message : 'Erro ao criar esporte'),
  });

  const createPaymentMethod = useMutation({
    mutationFn: () => adminSettingsApi.createPaymentMethod(token!, newPaymentMethod),
    onSuccess: async () => {
      setNewPaymentMethod({ code: '', name: '', is_active: true });
      await refreshAll();
      notify.success('Forma de pagamento criada');
    },
    onError: (error: unknown) => notify.error(error instanceof Error ? error.message : 'Erro ao criar forma de pagamento'),
  });

  const updateCategory = async (category: CategoryData) => {
    await adminSettingsApi.updateCategory(token!, category.id, {
      slug: category.slug,
      name: category.name,
      sort_order: category.sort_order,
    });
    await refreshAll();
    notify.success('Categoria atualizada');
  };

  const updateSport = async (sport: SportData) => {
    await adminSettingsApi.updateSport(token!, sport.id, {
      slug: sport.slug,
      name: sport.name,
    });
    await refreshAll();
    notify.success('Esporte atualizado');
  };

  const updatePaymentMethod = async (paymentMethod: PaymentMethodOptionData) => {
    await adminSettingsApi.updatePaymentMethod(token!, paymentMethod.id, {
      code: paymentMethod.code,
      name: paymentMethod.name,
      is_active: paymentMethod.is_active,
    });
    await refreshAll();
    notify.success('Forma de pagamento atualizada');
  };

  const deleteCategory = useMutation({
    mutationFn: (id: number) => adminSettingsApi.deleteCategory(token!, id),
    onSuccess: async () => { await refreshAll(); notify.success('Categoria excluída'); },
    onError: (error: unknown) => notify.error(error instanceof Error ? error.message : 'Erro ao excluir categoria'),
  });

  const deleteSport = useMutation({
    mutationFn: (id: number) => adminSettingsApi.deleteSport(token!, id),
    onSuccess: async () => { await refreshAll(); notify.success('Esporte excluído'); },
    onError: (error: unknown) => notify.error(error instanceof Error ? error.message : 'Erro ao excluir esporte'),
  });

  const deletePaymentMethod = useMutation({
    mutationFn: (id: number) => adminSettingsApi.deletePaymentMethod(token!, id),
    onSuccess: async () => { await refreshAll(); notify.success('Forma de pagamento excluída'); },
    onError: (error: unknown) => notify.error(error instanceof Error ? error.message : 'Erro ao excluir forma de pagamento'),
  });

  if (!currentUser.isAdmin) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <div className="inline-flex items-center gap-2 rounded-full border border-live/30 bg-live/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-live">
            <ShieldCheck className="h-3.5 w-3.5" />
            Apenas administradores
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  const isLoading = loadingCategories || loadingSports || loadingPaymentMethods;

  return (
    <div className="mx-auto w-full max-w-[min(72rem,calc(100vw-2rem))] space-y-8">
      <header>
        <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-violet-400">Configurações</p>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Gerencie o catálogo base do sistema: categorias, esportes e formas de pagamento.
        </p>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="divide-y divide-border border-b border-border">
          <SettingsSection
            title="Categorias"
            description="Usadas na inscrição e no cadastro de categorias do campeonato."
            createForm={(
              <div className="grid gap-3 md:grid-cols-[1fr_1.2fr_120px_auto]">
                <Input value={newCategory.slug} onChange={(e) => setNewCategory((current) => ({ ...current, slug: e.target.value }))} placeholder="beginner" className="border-border bg-background/50" />
                <Input value={newCategory.name} onChange={(e) => setNewCategory((current) => ({ ...current, name: e.target.value }))} placeholder="Beginner" className="border-border bg-background/50" />
                <Input value={newCategory.sort_order} onChange={(e) => setNewCategory((current) => ({ ...current, sort_order: e.target.value.replace(/\D/g, '') }))} placeholder="0" className="border-border bg-background/50" />
                <ActionButton icon={<PlusCircle className="h-4 w-4" />} loading={createCategory.isPending} onClick={() => createCategory.mutate()} />
              </div>
            )}
          >
            {categoryDrafts.map((category, index) => (
              <EditableRow
                key={category.id}
                fields={(
                  <>
                    <Input value={category.slug} onChange={(e) => setCategoryDrafts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, slug: e.target.value } : item))} className="border-border bg-background/50" />
                    <Input value={category.name} onChange={(e) => setCategoryDrafts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, name: e.target.value } : item))} className="border-border bg-background/50" />
                    <Input value={String(category.sort_order)} onChange={(e) => setCategoryDrafts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, sort_order: Number(e.target.value.replace(/\D/g, '') || 0) } : item))} className="border-border bg-background/50" />
                  </>
                )}
                onSave={() => updateCategory(category)}
                onDelete={() => deleteCategory.mutate(category.id)}
              />
            ))}
          </SettingsSection>

          <SettingsSection
            title="Esportes"
            description="Aparecem na navegação, nos complexos e nos campeonatos."
            createForm={(
              <div className="grid gap-3 md:grid-cols-[1fr_1.2fr_auto]">
                <Input value={newSport.slug} onChange={(e) => setNewSport((current) => ({ ...current, slug: e.target.value }))} placeholder="footvolley" className="border-border bg-background/50" />
                <Input value={newSport.name} onChange={(e) => setNewSport((current) => ({ ...current, name: e.target.value }))} placeholder="Footvolley" className="border-border bg-background/50" />
                <ActionButton icon={<PlusCircle className="h-4 w-4" />} loading={createSport.isPending} onClick={() => createSport.mutate()} />
              </div>
            )}
          >
            {sportDrafts.map((sport, index) => (
              <EditableRow
                key={sport.id}
                fields={(
                  <>
                    <Input value={sport.slug} onChange={(e) => setSportDrafts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, slug: e.target.value } : item))} className="border-border bg-background/50" />
                    <Input value={sport.name} onChange={(e) => setSportDrafts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, name: e.target.value } : item))} className="border-border bg-background/50" />
                  </>
                )}
                compact
                onSave={() => updateSport(sport)}
                onDelete={() => deleteSport.mutate(sport.id)}
              />
            ))}
          </SettingsSection>

          <SettingsSection
            title="Formas de pagamento"
            description="Catálogo central usado em preferências de complexos e campeonatos."
            createForm={(
              <div className="grid gap-3 md:grid-cols-[1fr_1.2fr_140px_auto]">
                <Input value={newPaymentMethod.code} onChange={(e) => setNewPaymentMethod((current) => ({ ...current, code: e.target.value }))} placeholder="pix" className="border-border bg-background/50" />
                <Input value={newPaymentMethod.name} onChange={(e) => setNewPaymentMethod((current) => ({ ...current, name: e.target.value }))} placeholder="PIX" className="border-border bg-background/50" />
                <label className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2 text-sm">
                  <span>Ativo</span>
                  <Switch checked={newPaymentMethod.is_active} onCheckedChange={(checked) => setNewPaymentMethod((current) => ({ ...current, is_active: checked }))} />
                </label>
                <ActionButton icon={<PlusCircle className="h-4 w-4" />} loading={createPaymentMethod.isPending} onClick={() => createPaymentMethod.mutate()} />
              </div>
            )}
          >
            {paymentMethodDrafts.map((paymentMethod, index) => (
              <div key={paymentMethod.id} className="grid gap-3 rounded-xl border border-border px-4 py-3 md:grid-cols-[1fr_1.2fr_140px_auto_auto] md:items-center">
                <Input value={paymentMethod.code} onChange={(e) => setPaymentMethodDrafts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, code: e.target.value } : item))} className="border-border bg-background/50" />
                <Input value={paymentMethod.name} onChange={(e) => setPaymentMethodDrafts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, name: e.target.value } : item))} className="border-border bg-background/50" />
                <label className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2 text-sm">
                  <span>Ativo</span>
                  <Switch checked={paymentMethod.is_active} onCheckedChange={(checked) => setPaymentMethodDrafts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, is_active: checked } : item))} />
                </label>
                <ActionButton icon={<Save className="h-4 w-4" />} onClick={() => updatePaymentMethod(paymentMethod)} />
                <DeleteButton onClick={() => deletePaymentMethod.mutate(paymentMethod.id)} />
              </div>
            ))}
          </SettingsSection>
        </div>
      )}
    </div>
  );
};

const SettingsSection = ({
  title,
  description,
  createForm,
  children,
}: {
  title: string;
  description: string;
  createForm: ReactNode;
  children: ReactNode;
}) => (
  <section className="space-y-2 py-6">
    <div className="mb-4">
      <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-violet-300">
        <Settings2 className="h-4 w-4" />
        {title}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
    <div className="rounded-xl border border-border px-4 py-3">
      {createForm}
    </div>
    <div className="space-y-2">
      {children}
    </div>
  </section>
);

const EditableRow = ({
  fields,
  onSave,
  onDelete,
  compact = false,
}: {
  fields: ReactNode;
  onSave: () => Promise<void>;
  onDelete: () => void;
  compact?: boolean;
}) => (
  <div className={`grid gap-3 rounded-xl border border-border px-4 py-3 ${compact ? 'md:grid-cols-[1fr_1.2fr_auto_auto]' : 'md:grid-cols-[1fr_1.2fr_120px_auto_auto]'} md:items-center`}>
    {fields}
    <ActionButton icon={<Save className="h-4 w-4" />} onClick={() => { void onSave(); }} />
    <DeleteButton onClick={onDelete} />
  </div>
);

const ActionButton = ({
  icon,
  loading = false,
  onClick,
}: {
  icon: ReactNode;
  loading?: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    disabled={loading}
    onClick={onClick}
    className="inline-flex items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/10 px-3 py-2.5 text-sm font-semibold text-foreground transition-smooth hover:bg-violet-500/20 disabled:opacity-50"
  >
    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
  </button>
);

const DeleteButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm font-semibold text-red-400 transition-smooth hover:bg-red-500/20"
  >
    <Trash2 className="h-4 w-4" />
  </button>
);

export default AdminSettings;
