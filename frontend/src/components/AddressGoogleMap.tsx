import React from "react";
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { useAppDispatch, useAppSelector } from "../redux/reduxHooks";
import Button from "./Button";
import { resetState } from "../slices/AddressFormSlice";

const mapStyle = {
  height: "300px",
  width: "100%",
};

interface AddressGoogleMapProps {
  onNextStep: () => void;
  onManualAdd: () => void;
}

const AddressGoogleMap = ({
  onNextStep,
  onManualAdd,
}: AddressGoogleMapProps): React.ReactElement => {
  const dispatch = useAppDispatch();
  const { address } = useAppSelector((state) => state.addressForm);

  const DEFAULT_ZOOM = 20;
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyAEQ18BgELzIU34xtENErSA_1QakHwMeV0",
  });

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

  const handelClickOnMap = () => {};
  return (
    <>
      {isLoaded ? (
        <>
          <GoogleMap
            center={position}
            zoom={DEFAULT_ZOOM}
            mapContainerStyle={mapStyle}
            onClick={handelClickOnMap}
          >
            <MarkerF position={position} />
          </GoogleMap>
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
      ) : (
        <></>
      )}
    </>
  );
};

export default AddressGoogleMap;
