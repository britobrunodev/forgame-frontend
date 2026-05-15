import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StaffAccessManager } from '@/components/staff-access/StaffAccessManager';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';

const ManagementChampionshipUsers = () => {
  const { t } = useLanguage();
  const { currentUser, activeGestorRole } = useSession();
  const navigate = useNavigate();
  const canAccess = currentUser.isAdmin || activeGestorRole === 'owner';

  useEffect(() => {
    if (!canAccess) navigate('/management', { replace: true });
  }, [canAccess, navigate]);

  if (!canAccess) return null;

  return (
    <StaffAccessManager
      scope="championship"
      title={t('users')}
      intro={t('managementChampionshipUsersIntro')}
      showBackButton
    />
  );
};

export default ManagementChampionshipUsers;
