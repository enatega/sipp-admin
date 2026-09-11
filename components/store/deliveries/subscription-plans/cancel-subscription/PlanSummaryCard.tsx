'use client';

import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function PlanSummaryCard() {
  return (
    <div className="h-fit rounded-lg border bg-white p-4">
      <div className="mb-3 flex items-start gap-3 border-b pb-3">
        <div className="rounded-xl bg-primary/10 p-2 text-primary">
          <Sparkles className="size-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">Basic Plan</p>
            <Badge className="bg-help-green text-white hover:bg-help-green">Active</Badge>
          </div>
          <p className="text-sm text-mute">Get started with the essentials</p>
        </div> 
      </div>

      <div className="space-y-2 border-b pb-3">
        <div className="flex justify-between"><span className="text-mute">Billing cycle</span><span>Monthly</span></div>
        <div className="flex justify-between"><span className="text-mute">Current price</span><span>$99/month</span></div>
        <div className="flex justify-between"><span className="text-mute">Commission</span><span className="text-primary">10%</span></div>
      </div>

      <div className="mt-3 rounded-lg bg-accent p-3">
        <p className="text-mute">Access until</p>
        <p className="font-medium">May 26, 2026</p>
        <p className="text-mute text-sm mt-1">After this, you&apos;ll be removed to Default Plan (20% commission).</p>
      </div>
    </div>
  );
}
