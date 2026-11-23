'use client';

import { cn } from '@/lib/utils';
import { LucideIcon, Search, X } from 'lucide-react';
import React from 'react';
import { useTranslations } from 'next-intl';

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  icon?: React.ReactNode;
  iconComponent?: LucideIcon;
  text?: string;
  onChangeText?: (text: string) => void;
  containerClass?: string;
  inputClassName?: string;
}

const SearchInput = ({
  icon,
  iconComponent: IconComponent,
  placeholder,
  text,
  onChangeText,
  containerClass,
  inputClassName,
  ...props
}: SearchInputProps) => {
  const t = useTranslations('searchInput');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChangeText) {
      onChangeText(e.target.value);
    }
  };

  const handleClear = () => {
    if (onChangeText) {
      onChangeText('');
    }
  };

  return (
    <div className={cn('relative flex flex-1', containerClass)}>
      <input
        placeholder={placeholder ?? t('placeholder')}
        value={text}
        onChange={handleChange}
        className={cn(
          'flex-1 text-sm h-10 px-4 pl-11 gap-2 bg-white border border-stroke rounded-md shadow-sm hover:border-secondary-gray-middle focus:border-primary outline-none',
          inputClassName,
        )}
        {...props}
      />
      <span className="absolute left-4 top-1/2 transform -translate-y-1/2">
        {icon ||
          (IconComponent ? (
            <IconComponent className="w-5 h-5 text-primary" />
          ) : (
            <Search className="w-5 h-5 text-primary" />
          ))}
      </span>
      {text && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-4 top-1/2 transform -translate-y-1/2"
          aria-label={t('clearSearch')}
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      )}
    </div>
  );
};

export { SearchInput };