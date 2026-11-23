import Image from 'next/image';
import { useFormikContext } from 'formik';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { ApiErrorResponse } from '@/types';
import { returnErrorMessage } from '@/lib/toast-error';
import { useGetAllShopTypesSimple } from '@/hooks/api/super-admin/enatega-deliveries/shop-type';
import DisplayError from '@/components/shared/DisplayError';
import NoDataFound from '@/components/shared/NoDataFound';
import { Store } from './types';

export function ShopTypeSection() {
  const t = useTranslations('lumiFood.stores.addStore.step2');
  const tErrors = useTranslations('lumiFood.stores.addStore.step2.errors');
  const { values, setFieldValue } = useFormikContext<Store>();

  const { data: shopTypes, isLoading, isError, error, refetch } = useGetAllShopTypesSimple();

  return (
    <div className="p-10 bg-white rounded-xl shadow space-y-5">
      <div className="mb-10 space-y-2">
        <h3 className="text-2xl font-semibold">{t('title')}</h3>
        <p className="text-mute text-sm">{t('description')}</p>
      </div>
      
      <div className="space-y-3">
        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-gray-200 bg-gray-50 animate-pulse"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                <div className="w-16 h-4 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : isError ? (
          /* Error State */
          <DisplayError
            title={tErrors('fetchFailedTitle')}
            message={
              returnErrorMessage(error as ApiErrorResponse) ||
              tErrors('fetchFailed')
            }
            onRetry={refetch}
          />
        ) : !shopTypes || shopTypes.length === 0 ? (
          /* No Data State */
          <NoDataFound title={tErrors('noShopTypes')} />
        ) : (
          /* Success State */
          <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {shopTypes.map((shopType) => {
              const isSelected = values.shopType === shopType.id;
              return (
                <button
                  key={shopType.id}
                  type="button"
                  onClick={() => {
                    setFieldValue('shopType', shopType.id);
                  }}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all',
                    isSelected
                      ? 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-2'
                      : 'border-gray-200 bg-white hover:border-primary hover:bg-primary/5',
                  )}
                >
                  <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    {shopType.image ? (
                      <Image
                        src={shopType.image}
                        alt={shopType.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-primary">
                        {shopType.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-center line-clamp-2">
                    {shopType.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
