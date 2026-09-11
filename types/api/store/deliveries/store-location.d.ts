export interface IGetStoreLocationResponse {
  store_id: string;

  lat?: number | string | null;
  lng?: number | string | null;
  zone_shape: 'Point' | 'Polygon' | 'LineString' | 'Circle' | null;
  address_circle_data: {
    type: 'Circle';
    center: {
      lat: number;
      lng: number;
    };
    radius: number;
  } | null;
  address_zone_polygon: {
    type: 'Point' | 'Polygon' | 'LineString';
    coordinates: number[] | number[][] | number[][][];
  } | null;
  store_location: {
    latitude: string;
    longitude: string;
  };
}
