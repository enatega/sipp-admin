import { ClearFiltersButton } from '@/components/shared/filters/ClearFiltersButton';
import { DateRangeFilter } from '@/components/shared/filters/DateRangeFilter';
import SearchUrl from '@/components/shared/SearchUrl';

export function Filters() {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchUrl containerClass="max-w-md w-full" />
      <DateRangeFilter />
      <ClearFiltersButton paramKeys={['search', 'startDate', 'endDate']} />
    </div>
  );
}
