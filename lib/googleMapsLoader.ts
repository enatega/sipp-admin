import { useJsApiLoader } from '@react-google-maps/api';

const GOOGLE_MAPS_LOADER_ID = 'google-maps-loader-singleton';

const ALL_LIBRARIES: ('drawing' | 'geometry' | 'places' | 'visualization')[] = [
  'places',
  'geometry',
];

export interface UseGoogleMapsLoaderOptions {
  googleMapsApiKey?: string;
  libraries?: ('drawing' | 'geometry' | 'places' | 'visualization')[];
}

export function useGoogleMapsLoader(_options: UseGoogleMapsLoaderOptions = {}) {
  return useJsApiLoader({
    id: GOOGLE_MAPS_LOADER_ID,
    googleMapsApiKey:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      _options.googleMapsApiKey ||
      '',
    libraries: ALL_LIBRARIES,
  });
}

export function getGoogleMapsLoaderId() {
  return GOOGLE_MAPS_LOADER_ID;
}
