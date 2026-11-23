import { Suspense } from 'react';
import EnategaLoader from '@/components/shared/EnategaLoader';
import CustomerLoyaltyFilters from '@/components/super-admin/enatega-deliveries/customer-loyalty-and-referrals/filters';
import { LoyalPointsBreakdown } from '@/components/super-admin/enatega-deliveries/customer-loyalty-and-referrals/loyal-points-breakdown';
import PointConversion from '@/components/super-admin/enatega-deliveries/customer-loyalty-and-referrals/point-conversion';
import { ReferralAndLoyaltyHistory } from '@/components/super-admin/enatega-deliveries/customer-loyalty-and-referrals/referral-and-loyalty-history';
import { ReferralRules } from '@/components/super-admin/enatega-deliveries/customer-loyalty-and-referrals/referral-rules';
import LoyaltyStatsCards from '@/components/super-admin/enatega-deliveries/customer-loyalty-and-referrals/stats-cards';

const CustomerLoyaltyAndReferralsPage = () => {
  return (
    <Suspense fallback={<EnategaLoader />}>
      <div className="space-y-6">
        <CustomerLoyaltyFilters />
        <LoyaltyStatsCards />
        <PointConversion />
        <ReferralRules />
        <LoyalPointsBreakdown />
        <ReferralAndLoyaltyHistory />
      </div>
    </Suspense>
  );
};

export default CustomerLoyaltyAndReferralsPage;
