'use client';

type Props = {
  value: 'monthly' | 'yearly';
  onChange: (value: 'monthly' | 'yearly') => void;
};

export function BillingCycleToggle({ value, onChange }: Props) {
  return (
    <div className="inline-flex rounded-lg bg-accent p-1">
      <button
        type="button"
        className={`rounded-md px-8 py-2 text-sm ${value === 'monthly' ? 'bg-primary text-white' : 'text-mute'}`}
        onClick={() => onChange('monthly')}
      >
        Monthly
      </button>
      <button
        type="button"
        className={`rounded-md px-8 py-2 text-sm ${value === 'yearly' ? 'bg-primary text-white' : 'text-mute'}`}
        onClick={() => onChange('yearly')}
      >
        Yearly
      </button>
    </div>
  );
}
