import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useSession } from '@/session';
import { usersApi } from '@/lib/api';
import type { DocumentType, PaymentMethod, PlayerCharacteristic, PlayerLevel, SportId, UniformSize } from '@/types';

const useProfileSync = () => {
  const { token, updateCurrentUser } = useSession();

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    usersApi.getProfile(token).then((profile) => {
      if (cancelled) return;
      updateCurrentUser({
        name: profile.name,
        nickname: profile.nickname ?? undefined,
        avatarUrl: profile.picture_url ?? profile.google_picture_url ?? undefined,
        country: profile.country ?? undefined,
        phoneCountry: profile.phone_country ?? undefined,
        phoneNumber: profile.phone_number ?? undefined,
        documentType: (profile.document_type as DocumentType | null) ?? undefined,
        documentNumber: profile.document_number ?? undefined,
        uniformSize: (profile.uniform_size as UniformSize | null) ?? undefined,
        level: (profile.level as PlayerLevel | null) ?? 'beginner',
        preferences: (profile.preferred_sports ?? []) as SportId[],
        sportCharacteristics: (profile.sport_characteristics ?? {}) as Partial<Record<SportId, PlayerCharacteristic[]>>,
        preferredClassPaymentMethod: (profile.preferred_class_payment_method as PaymentMethod | null) ?? undefined,
        wins: profile.wins,
        losses: profile.losses,
        draws: profile.draws,
      });
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [token]);
};

export const AppLayout = () => {
  useProfileSync();
  return (
    <>
      <div aria-hidden="true" className="standalone-status-tint" />
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto animate-fade-in px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};
