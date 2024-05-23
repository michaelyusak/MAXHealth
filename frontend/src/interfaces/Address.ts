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

export const GoogleMapApiResponseToAddressRequest = (
  response: IGoogleMapApiResponse
): IAddressRequest => {
  const addressRequest: IAddressRequest = emptyAddressRequest();

  for (let i = response.address_components.length - 1; i >= 0; i--) {
    const component = response.address_components[i];
    switch (component.types[0]) {
      case "administrative_area_level_4":
        addressRequest.subdistrict = component.long_name;
        break;
      case "administrative_area_level_3":
        addressRequest.district = component.long_name;
        break;
      case "administrative_area_level_2":
        addressRequest.city = component.long_name;
        break;
      case "administrative_area_level_1":
        addressRequest.province = component.long_name;
        break;
      default:
        break;
    }
  }

  addressRequest.address = response.formatted_address;
  addressRequest.latitude = response.geometry.location.lat;
  addressRequest.longitude = response.geometry.location.lng;

  return addressRequest;
};
