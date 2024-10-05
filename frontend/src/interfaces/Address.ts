export interface IAddress {
  id?: number;
  province?: IArea;
  city?: IArea;
  district?: IArea;
  subdistrict?: IArea;
  province_name: string;
  city_name: string;
  district_name: string;
  subdistrict_name: string;
  latitude: string;
  longitude: string;
  label?: string;
  address: string;
  is_main?: boolean;
}

export interface IArea {
  id: number;
  code: string;
  name: string;
}

export interface IAddressRequest {
  id?: number;
  province?: string;
  city?: string;
  district?: string;
  subdistrict?: string;
  latitude?: string;
  longitude?: string;
  label?: string;
  address?: string;
  isMain?: boolean;
}

export const emptyAddressRequest = (): IAddressRequest => {
  return {
    id: 0,
    province: "",
    city: "",
    district: "",
    subdistrict: "",
    latitude: "",
    longitude: "",
    label: "",
    address: "",
    isMain: false,
  };
};

export interface IGoogleMapApiResponse {
  address_components: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
  formatted_address: string;
  geometry: {
    location: {
      lat: string;
      lng: string;
    };
  };
}

export const GeocodeReverseResponseToAddressRequest = (
  data: INominatimOpenStreetMapResponse
): IAddressRequest => {
  const addressRequest: IAddressRequest = emptyAddressRequest();

  addressRequest.province = data.address.city
  addressRequest.city = data.address.city_district
  addressRequest.district = data.address.suburb
  addressRequest.subdistrict = data.address.neighbourhood

  addressRequest.address = data.display_name;
  addressRequest.latitude = data.lat;
  addressRequest.longitude = data.lon;

  return addressRequest;
};

export interface INominatimOpenStreetMapResponse {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  class: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  address: INominatimOpenStreetMapAddressResponse;
  boundingbox: string[];
}

export interface INominatimOpenStreetMapAddressResponse {
  city_block: string;
  neighbourhood: string;
  suburb: string;
  city_district: string;
  city: string;
  "ISO3166-2-lvl4": string;
  region: string;
  "ISO3166-2-lvl3": string;
  postcode: string;
  country: string;
  country_code: string;
}
