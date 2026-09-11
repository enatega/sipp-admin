'use client';

import { Upload } from 'lucide-react';
import SearchUrl from '@/components/shared/SearchUrl';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function BillingHistoryFilters() {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <SearchUrl
        containerClass="w-full max-w-sm"
        paramKey="search"
        placeholder="Search invoice ID or plan..."
      />

      <Select defaultValue="all">
        <SelectTrigger className="min-w-[180px] h-11 bg-white">
          <SelectValue placeholder="All status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All status</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" className="h-11 gap-2">
        <Upload className="size-4" /> Export
      </Button>
    </div>
  );
}
