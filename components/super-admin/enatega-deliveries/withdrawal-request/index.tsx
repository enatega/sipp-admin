import { Heading } from '@/components/shared/Heading';
import { useTranslations } from 'next-intl';
import { WithdrawalRequestTabs } from './Tabs';

export function WithdrawalRequest() {
  const t = useTranslations('withdrawalRequests');

  return (
    <div>
      <Heading title={t('title')} containerClassName="mb-7" />
      <WithdrawalRequestTabs />
    </div>
  );
}
