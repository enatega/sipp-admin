'use client';

import { Check, Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

function CopyButton({ text }: { text: string }) {
  const t = useTranslations('copyButton');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
      title={t('copyToClipboard')}
      aria-label={t('copyToClipboard')}
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-600" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );
}

export default CopyButton
