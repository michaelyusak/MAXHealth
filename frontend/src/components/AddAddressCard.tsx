import React, { useContext, useState } from "react";

import Button from "./Button";
import { useAppDispatch } from "../redux/reduxHooks";
import { addAddress, resetState } from "../slices/AddressFormSlice";
import AddressSearch from "./AddressSearch";
import { IInputField } from "../interfaces/InputField";
import { HandleGeocodeReverse, HandleGeocodeSearch } from "../util/API";
import { ToastContext } from "../contexts/ToastData";
import { HandleShowToast } from "../util/ShowToast";
import {
  GeocodeReverseResponseToAddressRequest,
  IAddressRequest,
  INominatimOpenStreetMapResponse,
} from "../interfaces/Address";
import pinIcon from "../assets/img/pin-icon.png";

interface AddAddressCardProps {
  onNextStep: () => void;
  onManualAdd: () => void;
}

const AddAddressCard = ({
  onNextStep,
  onManualAdd,
}: AddAddressCardProps): React.ReactElement => {
  const { setToast } = useContext(ToastContext);

  const dispatch = useAppDispatch();

  const inputField: IInputField = {
    name: "address",
    type: "text",
    placeholder: "Type your address",
    isRequired: true,
  };

  const [inputValues, setInputValues] = useState<{
    [key: string]: {
      value: string | number | boolean;
      error: string;
    };
  }>({
    address: {
      value: "",
      error: "",
    },
  });

  function handleInputOnChange(
    key: string,
    value: string | number | boolean,
    error: string
  ) {
    setInputValues((prevInputValues) => {
      const updatedValue = {
        ...prevInputValues,
        [key]: { value, error },
      };

      return updatedValue;
    });
  }

  const [disableSubmit, setDisableSubmit] = useState<boolean>(true);

  function handleSearchAddress(
    callback: (data: INominatimOpenStreetMapResponse[]) => void
  ) {
    if (inputValues["address"].value) {
      HandleGeocodeSearch(inputValues["address"].value as string)
        .then((data) => {
          callback(data);
        })
        .catch((error: Error) => {
          HandleShowToast(setToast, false, error.message, 5);
        });
    }
  }

  function handleSearchCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          HandleGeocodeReverse(
            position.coords.latitude,
            position.coords.longitude
          )
            .then((data) => {
              const address: IAddressRequest =
                GeocodeReverseResponseToAddressRequest(data);

              dispatch(addAddress(address));
              onNextStep();
            })
            .catch((error: Error) => {
              HandleShowToast(setToast, false, error.message, 5);
            });
        },
        () => {
          HandleShowToast(setToast, false, "Failed to get location", 5);
        }
      );
    } else {
      HandleShowToast(setToast, false, "Geo location unsupported", 5);
    }
  }

  return (
    <div className="flex flex-col gap-[200px]">
      <div className="flex flex-col gap-[1rem]">
        <AddressSearch
          inputField={inputField}
          inputValue={inputValues[inputField.name]}
          onChange={handleInputOnChange}
          onSearch={handleSearchAddress}
          onSelectOption={(opt) => {
            dispatch(addAddress(opt));
            setDisableSubmit(false);
          }}
        />
        <div
          className="flex flex-row items-center gap-[0.5rem] cursor-pointer"
          onClick={handleSearchCurrentLocation}
        >
          <img className="w-[20px]" alt="Pin Icon" src={pinIcon}></img>
          Use my current location
        </div>
      </div>
      <div className="flex flex-col gap-[1rem]">
        <div className="flex flex-col items-center gap-[1rem]">
          <Button
            type="button"
            buttonStyle="blue"
            onClick={onNextStep}
            disabled={disableSubmit}
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
            Want another way? Fill in the address manually
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddAddressCard;
