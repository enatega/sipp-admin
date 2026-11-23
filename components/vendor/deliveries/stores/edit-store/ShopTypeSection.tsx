import Image from 'next/image';
import { useFormikContext } from 'formik';
import { useTranslations } from 'next-intl';
import { useGetAllShopTypesSimple } from '@/hooks/api/deliveries/shop-type';
import { cn } from '@/lib/utils';
import { ApiErrorResponse } from '@/types';
import { returnErrorMessage } from '@/lib/toast-error';
import DisplayError from '@/components/shared/DisplayError';
import NoDataFound from '@/components/shared/NoDataFound';
import { VendorStore } from './types';

export function ShopTypeSection() {
  const t = useTranslations('lumiFood.stores.addStore.step2');
  const tErrors = useTranslations('lumiFood.stores.addStore.step2.errors');
  const { values, setFieldValue } = useFormikContext<VendorStore>();

  const { data: shopTypes, isLoading, isError, error, refetch } =
    useGetAllShopTypesSimple();

  return (
    <div className="space-y-5 rounded-xl bg-white p-10 shadow">
      <div className="mb-10 space-y-2">
        <h3 className="text-2xl font-semibold">{t('title')}</h3>
        <p className="text-sm text-mute">{t('description')}</p>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex animate-pulse flex-col items-center justify-center gap-2 rounded-lg border-2 border-gray-200 bg-gray-50 p-4"
              >
                <div className="h-12 w-12 rounded-lg bg-gray-200" />
                <div className="h-4 w-16 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <DisplayError
            title={tErrors('fetchFailedTitle')}
            message={
              returnErrorMessage(error as ApiErrorResponse) ||
              tErrors('fetchFailed')
            }
            onRetry={refetch}
          />
        ) : !shopTypes || shopTypes.length === 0 ? (
          <NoDataFound title={tErrors('noShopTypes')} />
        ) : (
          <div className="grid grid-cols-3 gap-3 lg:grid-cols-4 xl:grid-cols-5">
            {shopTypes.map((shopType) => {
              const isSelected = values.shopType === shopType.id;

              return (
                <button
                  key={shopType.id}
                  type="button"
                  onClick={() => setFieldValue('shopType', shopType.id)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all',
                    isSelected
                      ? 'ring-primary border-primary bg-primary/10 ring-2 ring-offset-2'
                      : 'border-gray-200 bg-white hover:border-primary hover:bg-primary/5',
                  )}
                >
                  <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
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
                  <span className="line-clamp-2 text-center text-xs font-medium">
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
