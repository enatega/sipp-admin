import React from 'react';
import { ImagePreview } from '@/components/shared/ImagePreview';

type SvgIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface VerificationDocumentCardProps {
  title: string;
  icon: SvgIcon;
  frontImg?: string | null;
  backImg?: string | null;
  frontLabel: string;
  backLabel: string;
}

export function VerificationDocumentCard({
  title,
  icon: Icon,
  frontImg,
  backImg,
  frontLabel,
  backLabel,
}: VerificationDocumentCardProps) {
  return (
    <div className="rounded-xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-slate-100/50 p-5 transition-all duration-300">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-lg bg-primary p-2">
          <Icon className="h-4 w-4 text-white" />
        </div>
        <h4 className="font-semibold text-slate-800">{title}</h4>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <ImagePreview image={frontImg} label={frontLabel} />
        <ImagePreview image={backImg} label={backLabel} />
      </div>
    </div>
  );
}
