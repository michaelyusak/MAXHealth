import React from "react";
import { useAppDispatch, useAppSelector } from "../redux/reduxHooks";
import Button from "./Button";
import { resetState } from "../slices/AddressFormSlice";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { location_pin } from "../assets/img";

const mapStyle = {
  height: "300px",
  width: "100%",
};

interface AddressMapProps {
  onNextStep: () => void;
  onManualAdd: () => void;
}

const AddressMap = ({
  onNextStep,
  onManualAdd,
}: AddressMapProps): React.ReactElement => {
  const dispatch = useAppDispatch();
  const { address } = useAppSelector((state) => state.addressForm);

  const DEFAULT_ZOOM = 20;

  const position =
    address?.latitude && address.longitude
      ? {
          lat: Number(address?.latitude),
          lng: Number(address?.longitude),
        }
      : {
          lat: -6.5794118,
          lng: 106.8168173,
        };

  const myIcon = icon({
    iconUrl: location_pin,
    iconSize: [50, 50],
    iconAnchor: [25, 50],
    popupAnchor: [0, -20],
  });

  return (
    <>
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={DEFAULT_ZOOM}
        style={{
          height: mapStyle.height,
          width: mapStyle.width,
          borderRadius: "20px",
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker icon={myIcon} position={[position.lat, position.lng]}>
          <Popup>Here</Popup>
        </Marker>
      </MapContainer>

      {address?.address &&
        address?.subdistrict &&
        address.district &&
        address?.city &&
        address?.province && (
          <div>
            <p className="font-bold">{address.address}</p>
            <p>
              {address.subdistrict}, {address.district}, {address.city},{" "}
              {address.province}
            </p>
          </div>
        )}
      <div className="flex flex-col items-center gap-[1rem]">
        <Button
          type="button"
          buttonStyle="blue"
          onClick={onNextStep}
          additionalClassName="w-full py-2 px-3 rounded-lg"
        >
          Next
        </Button>
        <p
          className="cursor-pointer"
          onClick={() => {
            dispatch(resetState());
            onManualAdd();
          }}
        >
          Incorrect? Fill in the address manually
        </p>
      </div>
    </>
  );
};

export default AddressMap;
