import { StaffAccessManager } from '@/components/staff-access/StaffAccessManager';
import { useLanguage } from '@/i18n';

const ManagementAdminAccess = () => {
  const { t } = useLanguage();

  return (
    <StaffAccessManager
      adminOnly
      title={t('admin')}
      intro={t('adminAccessIntro')}
    />
  );
};

export default ManagementAdminAccess;
