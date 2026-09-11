'use client';

import React, { useState } from 'react';
import { ChevronDown, Flag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const PriorityStatus: React.FC = () => {
  const t = useTranslations('customerSupport.details.priorityStatus');
  const PRIORITIES = [
    {
      value: 'urgent',
      label: t('urgent'),
      textClass: 'text-help-red',
      bgClass: 'hover:bg-red-50/50',
    },
    {
      value: 'medium',
      label: t('medium'),
      textClass: 'text-amber-600',
      bgClass: 'hover:bg-amber-50/40',
    },
    {
      value: 'low',
      label: t('low'),
      textClass: 'text-emerald-600',
      bgClass: 'hover:bg-emerald-50/40',
    },
  ];
  const [priority, setPriority] = useState(PRIORITIES[1]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm border outline-none">
          <span
            className={`inline-flex items-center gap-2 px-2 py-0.5 rounded-full ${priority.textClass}`}
          >
            <Flag className="size-4" />
            <span className="font-medium">{priority.label}</span>
          </span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        sideOffset={8}
        className="w-[170px] p-1 rounded-xl overflow-hidden shadow-lg"
      >
        {PRIORITIES.map((p) => (
          <DropdownMenuItem
            key={p.value}
            onClick={() => setPriority(p)}
            className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${p.bgClass} rounded-md`}
          >
            <span
              className={`inline-flex items-center gap-2 ${p.textClass} rounded-full p-0.5`}
            >
              <Flag className="size-4" />
            </span>
            <span className={`text-sm ${p.textClass}`}>{p.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PriorityStatus;
