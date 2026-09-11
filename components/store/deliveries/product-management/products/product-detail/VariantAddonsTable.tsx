'use client';

import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTranslations } from 'next-intl';
import Status from '@/components/shared/Status';

interface Addon {
  name: string;
  options: number;
  availability: 'in_stock' | 'out_of_stock';
  type: string;
}

interface VariantAddonsTableProps {
  addons: Addon[];
}

export const VariantAddonsTable: React.FC<VariantAddonsTableProps> = ({
  addons,
}) => {
  const tSections = useTranslations('products.detail.sections');
  const tFields = useTranslations('products.detail.fields');

  if (addons.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-900">
        {tSections('addOns')}
      </h4>
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <TableHeader className="bg-gray-50">
              <TableRow className="border-b">
                <TableHead className="h-10 px-4 py-2 text-left font-medium text-gray-700">
                  {tFields('addOnName')}
                </TableHead>
                <TableHead className="h-10 px-4 py-2 text-left font-medium text-gray-700">
                  {tFields('options')}
                </TableHead>
                <TableHead className="h-10 px-4 py-2 text-left font-medium text-gray-700">
                  {tFields('stockAvailability')}
                </TableHead>
                <TableHead className="h-10 px-4 py-2 text-left font-medium text-gray-700">
                  {tFields('selectionType')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {addons.map((addon, idx) => (
                <TableRow
                  key={idx}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="px-4 py-3 text-gray-900 font-medium">
                    {addon.name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      {addon.options}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Status
                      status={
                        addon.availability === 'in_stock'
                          ? 'active'
                          : 'inactive'
                      }
                    />
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {addon.type}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </table>
        </div>
      </div>
    </div>
  );
};
