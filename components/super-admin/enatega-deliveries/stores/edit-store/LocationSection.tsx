import { useFormikContext } from 'formik';
import { useTranslations } from 'next-intl';
import InteractiveMap, {
  ZoneData,
} from '@/components/super-admin/general/zones/common/InteractiveMap';
import { DayTimingRow } from '@/components/super-admin/enatega-deliveries/stores/add-store/DayTimingRow';
import { Store } from './types';

const dayMapping = [
  { key: 'monday' },
  { key: 'tuesday' },
  { key: 'wednesday' },
  { key: 'thursday' },
  { key: 'friday' },
  { key: 'saturday' },
  { key: 'sunday' },
] as const;

export function LocationSection() {
  const t = useTranslations('lumiFood.stores.addStore.step4');
  const { values, setFieldValue, touched, errors } = useFormikContext<Store>();

  return (
    <div className="bg-white p-10 rounded-xl shadow space-y-10">
      <div className="mb-10 space-y-2">
        <h3 className="text-2xl font-semibold">{t('title')}</h3>
        <p className="text-mute text-sm">{t('description')}</p>
      </div>
      
      <div>
        <InteractiveMap
          value={values.location}
          onChange={(value: ZoneData | null) =>
            setFieldValue('location', value)
          }
          exactStoreLocation={values.exactStoreLocation}
          onExactStoreLocationChange={(value) =>
            setFieldValue('exactStoreLocation', value)
          }
          exactStoreLocationLabel={t('exactStoreLocationLabel')}
          exactStoreLocationDescription={t('exactStoreLocationDescription')}
          exactStoreLocationLatitudeLabel={t('exactStoreLocationLatitude')}
          exactStoreLocationLongitudeLabel={t('exactStoreLocationLongitude')}
          hideZoomControls
          searchSelectsMarker
        />
        {touched.location && errors.location ? (
          <div className="text-destructive text-sm mt-1">
            {errors.location as string}
          </div>
        ) : null}
        {touched.exactStoreLocation && errors.exactStoreLocation ? (
          <div className="text-destructive text-sm mt-1">
            {errors.exactStoreLocation as string}
          </div>
        ) : null}
      </div>

      <div>
        <h3 className="font-medium text-lg mb-4">{t('timings')}</h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="space-y-1">
              {dayMapping.map((day) => (
                <DayTimingRow
                  key={day.key}
                  day={t(`days.${day.key}`)}
                  value={values.storeTimings[day.key]}
                  onChange={(slots) =>
                    setFieldValue(`storeTimings.${day.key}`, slots)
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
