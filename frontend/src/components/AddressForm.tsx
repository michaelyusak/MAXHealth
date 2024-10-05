import React, { useContext, useEffect, useState } from "react";
import Input from "./Input";
import { IInputField } from "../interfaces/InputField";
import SelectOption from "./SelectOption";
import {
  HandleAddRaw,
  HandleGeocodeSearch,
  HandleGet,
  HandlePutRaw,
} from "../util/API";
import { HandleShowToast } from "../util/ShowToast";
import { ToastContext } from "../contexts/ToastData";
import Button from "./Button";
import Checkbox from "./Checkbox";
import AddressSearch from "./AddressSearch";
import { useAppDispatch, useAppSelector } from "../redux/reduxHooks";
import { Noop } from "../constants/Noop";
import {
  addAddressAutofillThunk,
  addAddressIsMain,
  addAddressLabel,
  resetState,
} from "../slices/AddressFormSlice";
import {
  IAddress,
  IArea,
  INominatimOpenStreetMapResponse,
  emptyAddressRequest,
} from "../interfaces/Address";
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";
import { useNavigate } from "react-router-dom";

interface AddressFormProps {
  initialAddress?: IAddress;
  onSubmit: () => void;
  isFilled?: boolean;
  onManualAdd: () => void;
}

const AddressForm = ({
  initialAddress,
  onSubmit,
  isFilled,
  onManualAdd,
}: AddressFormProps): React.ReactElement => {
  const navigate = useNavigate();
  const { setToast } = useContext(ToastContext);
  const dispatch = useAppDispatch();
  const { address } = useAppSelector((state) => state.addressForm);

  const [inputValues, setInputValues] = useState<{
    [key: string]: {
      value: string | number | boolean;
      error: string;
      file?: File | undefined;
    };
  }>({
    label: {
      value: initialAddress?.label ?? "",
      error: "",
    },
    province: {
      value: initialAddress?.province?.id ?? 0,
      error: "",
    },
    city: {
      value: initialAddress?.city?.id ?? 0,
      error: "",
    },
    district: {
      value: initialAddress?.district?.id ?? 0,
      error: "",
    },
    subdistrict: {
      value: initialAddress?.subdistrict?.id ?? 0,
      error: "",
    },
    address: {
      value: initialAddress?.address ?? "",
      error: "",
    },
    latitude: {
      value: initialAddress?.latitude
        ? initialAddress?.latitude
        : address?.latitude
        ? address?.latitude
        : 0,
      error: "",
    },
    longitude: {
      value: initialAddress?.longitude
        ? initialAddress?.longitude
        : address?.longitude
        ? address?.longitude
        : 0,
      error: "",
    },
    isMain: {
      value: initialAddress?.is_main ?? false,
      error: "",
    },
  });

  const inputFields: IInputField[] = [
    {
      name: "label",
      type: "text",
      placeholder: "Address Label e.g., Home",
      isRequired: false,
    },
    {
      name: "address",
      type: "text",
      placeholder: "Address",
      isRequired: true,
      readOnly:
        Number(inputValues["province"].value) <= 0 ||
        Number(inputValues["city"].value) <= 0 ||
        Number(inputValues["district"].value) <= 0 ||
        Number(inputValues["subdistrict"].value) <= 0,
    },
  ];

  const [provinceOptions, setProvinceOptions] = useState<IArea[]>([]);

  const [cityOptions, setCityOptions] = useState<IArea[]>([]);

  const [districtOptions, setDistrictOptions] = useState<IArea[]>([]);

  const [subdistrictOptions, setSubdistrictOptions] = useState<IArea[]>([]);

  function handleInputOnChange(
    key: string,
    value: string | number | boolean,
    error: string,
    file?: File
  ) {
    if (isFilled) {
      if (key === "label") dispatch(addAddressLabel(value as string));
      if (key === "isMain") dispatch(addAddressIsMain(value as boolean));
    }
    setInputValues((prevInputValues) => {
      const updatedValue = {
        ...prevInputValues,
        [key]: { value, error, file },
      };
      handleSetDisableSubmit(updatedValue);
      return updatedValue;
    });

    if (key === "province" && value != inputValues["province"].value) {
      if (
        !isFilled &&
        Number(value) > 0 &&
        Number(value) !== initialAddress?.province?.id
      ) {
        const province = provinceOptions.find((opt) => opt.id == value);
        if (province)
          HandleGet<{ cities: IArea[] }>(
            import.meta.env.VITE_DEPLOYMENT_URL +  `/cities?province_code=${province.code}`, true
          )
            .then((responseData) => {
              setCityOptions(responseData.cities);
              setInputValues((prevInputValues) => {
                const updatedValue = {
                  ...prevInputValues,
                  ["city"]: { value: 0, error: "" },
                  ["district"]: { value: 0, error: "" },
                  ["subdistrict"]: { value: 0, error: "" },
                };
                handleSetDisableSubmit(updatedValue);

                return updatedValue;
              });
            })
            .catch((error: Error) => {
              HandleShowToast(setToast, false, error.message, 5);
            });
      }
    }

    if (key === "city" && value != inputValues["city"].value) {
      if (
        !isFilled &&
        Number(value) > 0 &&
        Number(value) !== initialAddress?.city?.id
      ) {
        const city = cityOptions.find((opt) => opt.id == value);

        if (city)
          HandleGet<{ districts: IArea[] }>(
            import.meta.env.VITE_DEPLOYMENT_URL +  `/districts?city_code=${city.code}`, true
          )
            .then((responseData) => {
              setDistrictOptions(responseData.districts);
              setInputValues((prevInputValues) => {
                const updatedValue = {
                  ...prevInputValues,
                  ["district"]: { value: 0, error: "" },
                  ["subdistrict"]: { value: 0, error: "" },
                };
                handleSetDisableSubmit(updatedValue);

                return updatedValue;
              });
            })
            .catch((error: Error) => {
              HandleShowToast(setToast, false, error.message, 5);
            });
      }
    }

    if (key === "district" && value != inputValues["district"].value) {
      if (
        !isFilled &&
        Number(value) > 0 &&
        Number(value) !== initialAddress?.district?.id
      ) {
        const district = districtOptions.find((opt) => opt.id == value);

        if (district)
          HandleGet<{ subdistricts: IArea[] }>(
            import.meta.env.VITE_DEPLOYMENT_URL +  `/subdistricts?district_code=${district.code}`, true
          )
            .then((responseData) => {
              setSubdistrictOptions(responseData.subdistricts);
              setInputValues((prevInputValues) => {
                const updatedValue = {
                  ...prevInputValues,
                  ["subdistrict"]: { value: 0, error: "" },
                };
                handleSetDisableSubmit(updatedValue);

                return updatedValue;
              });
            })
            .catch((error: Error) => {
              HandleShowToast(setToast, false, error.message, 5);
            });
      }
    }
  }

  const [disableSubmit, setDisableSubmit] = useState<boolean>(true);

  function handleSetDisableSubmit(value: {
    [key: string]: {
      value: string | number | boolean;
      error: string;
      file?: File;
    };
  }) {
    let disabled = true;

    if (
      value["label"].error === "" &&
      value["address"].error === "" &&
      Number(value["province"].value) > 0 &&
      Number(value["city"].value) > 0 &&
      Number(value["district"].value) > 0 &&
      Number(value["subdistrict"].value) > 0 &&
      value["latitude"].value !== 0 &&
      value["longitude"].value !== 0
    ) {
      disabled = false;
    }

    setDisableSubmit(disabled);
  }

  useEffect(() => {
    if (initialAddress) {
      HandleGet<{ provinces: IArea[] }>(import.meta.env.VITE_DEPLOYMENT_URL +  "/provinces", true)
        .then((responseData) => {
          setProvinceOptions(responseData.provinces);
        })
        .catch((error: Error) => {
          HandleShowToast(setToast, false, error.message, 5);
        });
      if (initialAddress.province?.code !== undefined)
        HandleGet<{ cities: IArea[] }>(
          import.meta.env.VITE_DEPLOYMENT_URL +  `/cities?province_code=${initialAddress.province.code}`
        )
          .then((responseData) => {
            setCityOptions(responseData.cities);
          })
          .catch((error: Error) => {
            HandleShowToast(setToast, false, error.message, 5);
          });
      if (initialAddress.city?.code !== undefined)
        HandleGet<{ districts: IArea[] }>(
          import.meta.env.VITE_DEPLOYMENT_URL +  `/districts?city_code=${initialAddress.city.code}`
        )
          .then((responseData) => {
            setDistrictOptions(responseData.districts);
          })
          .catch((error: Error) => {
            HandleShowToast(setToast, false, error.message, 5);
          });
      if (initialAddress.district?.code !== undefined)
        HandleGet<{ subdistricts: IArea[] }>(
          import.meta.env.VITE_DEPLOYMENT_URL +  `/subdistricts?district_code=${initialAddress.district.code}`
        )
          .then((responseData) => {
            setSubdistrictOptions(responseData.subdistricts);
          })
          .catch((error: Error) => {
            HandleShowToast(setToast, false, error.message, 5);
          });
      return;
    }
    if (!isFilled) {
      HandleGet<{ provinces: IArea[] }>(import.meta.env.VITE_DEPLOYMENT_URL +  "/provinces", true)
        .then((responseData) => {
          setProvinceOptions(responseData.provinces);
        })
        .catch((error: Error) => {
          HandleShowToast(setToast, false, error.message, 5);
        });
    }
  }, [initialAddress, isFilled, setToast]);

  function handleSearchAddress(
    callback: (data: INominatimOpenStreetMapResponse[]) => void
  ) {
    if (
      inputValues["address"].value &&
      inputValues["city"].value &&
      inputValues["province"].value
    ) {
      HandleGeocodeSearch(inputValues["address"].value as string)
        .then((data) => {
          callback(data);
        })
        .catch((error: Error) => {
          HandleShowToast(setToast, false, error.message, 5);
        });
    }
  }

  function handleAddAddress() {
    if (!isFilled) {
      const url = import.meta.env.VITE_DEPLOYMENT_URL +  "/address";

      const provinceId = Number(inputValues["province"].value);
      const cityId = Number(inputValues["city"].value);
      const districtId = Number(inputValues["district"].value);
      const subdistrictId = Number(inputValues["subdistrict"].value);
      const latitude = String(inputValues["latitude"].value);
      const longitude = String(inputValues["longitude"].value);
      const label = inputValues["label"].value;
      const address = inputValues["address"].value;
      const isMain = inputValues["isMain"].value;

      const bodyRaw = JSON.stringify({
        province_id: provinceId,
        city_id: cityId,
        district_id: districtId,
        subdistrict_id: subdistrictId,
        latitude: latitude,
        longitude: longitude,
        label: label,
        address: address,
        is_main: isMain,
      });

      HandleAddRaw(url, bodyRaw, true)
        .then(() => {
          HandleShowToast(setToast, true, "Add address success", 5);
          onSubmit();
        })
        .catch((error: Error) => {
          if (error.message == MsgRefreshTokenNotFound) {
            navigate("/auth/login");
          }

          HandleShowToast(setToast, false, error.message, 5);
        });
    } else {
      dispatch(addAddressAutofillThunk(address ?? emptyAddressRequest()))
        .then(() => {
          HandleShowToast(setToast, true, "Add address success", 5);
          onSubmit();
        })
        .catch((error: Error) => {
          if (error.message == MsgRefreshTokenNotFound) {
            navigate("/auth/login");
          }

          HandleShowToast(setToast, false, error.message, 5);
        });
    }
  }

  function handleEditAddress() {
    const provinceId = Number(inputValues["province"].value);
    const cityId = Number(inputValues["city"].value);
    const districtId = Number(inputValues["district"].value);
    const subdistrictId = Number(inputValues["subdistrict"].value);
    const latitude = String(inputValues["latitude"].value);
    const longitude = String(inputValues["longitude"].value);
    const label = inputValues["label"].value;
    const address = inputValues["address"].value;
    const isMain = inputValues["isMain"].value;

    const bodyRaw = JSON.stringify({
      province_id: provinceId,
      city_id: cityId,
      district_id: districtId,
      subdistrict_id: subdistrictId,
      latitude: latitude,
      longitude: longitude,
      label: label,
      address: address,
      is_main: isMain,
    });

    const url = import.meta.env.VITE_DEPLOYMENT_URL +  `/address/${initialAddress?.id}`;

    HandlePutRaw(bodyRaw, url, true)
      .then(() => {
        HandleShowToast(setToast, true, "Edit address success", 5);
        onSubmit();
      })
      .catch((error: Error) => {
        if (error.message == MsgRefreshTokenNotFound) {
          navigate("/auth/login");
        }

        HandleShowToast(setToast, false, error.message, 5);
      });
  }

  return (
    <form className="flex flex-col gap-[5px] w-full">
      <div className="w-full h-[100%] justify-between flex flex-col items-center gap-[25px]">
        <div className="flex flex-col gap-[0.75rem] w-full">
          <p>Label</p>
          <Input
            key={inputFields[0].name}
            inputField={inputFields[0]}
            value={inputValues[inputFields[0].name]?.value}
            isError={inputValues[inputFields[0].name]?.error.length > 0}
            onChange={(value, error, file) =>
              handleInputOnChange(inputFields[0].name, value, error, file)
            }
          />
          {!isFilled ? (
            <>
              <p>Province</p>
              <SelectOption
                placeholder="Province"
                options={provinceOptions}
                value={inputValues["province"].value as string}
                onChange={(e) =>
                  handleInputOnChange("province", e.target.value, "")
                }
              />
              <p>City</p>
              <SelectOption
                placeholder="City"
                options={cityOptions}
                value={inputValues["city"].value as string}
                onChange={(e) =>
                  handleInputOnChange("city", e.target.value, "")
                }
                disabled={Number(inputValues["province"].value) <= 0}
              />
              <p>District</p>
              <SelectOption
                placeholder="District"
                options={districtOptions ?? []}
                value={inputValues["district"].value as string}
                onChange={(e) =>
                  handleInputOnChange("district", e.target.value, "")
                }
                disabled={
                  Number(inputValues["province"].value) <= 0 ||
                  Number(inputValues["city"].value) <= 0
                }
              />
              <p>Subdistrict</p>
              <SelectOption
                placeholder="Subdistrict"
                options={subdistrictOptions}
                value={inputValues["subdistrict"].value as string}
                onChange={(e) =>
                  handleInputOnChange("subdistrict", e.target.value, "")
                }
                disabled={
                  Number(inputValues["province"].value) <= 0 ||
                  Number(inputValues["city"].value) <= 0 ||
                  Number(inputValues["district"].value) <= 0
                }
              />
              <p>Address</p>
              <AddressSearch
                inputField={inputFields[1]}
                inputValue={inputValues[inputFields[1].name]}
                onChange={handleInputOnChange}
                onSearch={handleSearchAddress}
                onSelectOption={(opt) => {
                  handleInputOnChange("latitude", opt.latitude as string, "");
                  handleInputOnChange("longitude", opt.longitude as string, "");
                  handleInputOnChange("address", opt.address as string, "");
                }}
              />
            </>
          ) : (
            <>
              <p>Province</p>
              <Input
                inputField={{
                  type: "text",
                  name: "province",
                  isRequired: true,
                  readOnly: true,
                }}
                value={address?.province as string}
                isError={false}
                onChange={Noop}
              />
              <p>City</p>
              <Input
                inputField={{
                  type: "text",
                  name: "city",
                  isRequired: true,
                  readOnly: true,
                }}
                value={address?.city as string}
                isError={false}
                onChange={Noop}
              />
              <p>District</p>
              <Input
                inputField={{
                  type: "text",
                  name: "district",
                  isRequired: true,
                  readOnly: true,
                }}
                value={address?.district as string}
                isError={false}
                onChange={Noop}
              />
              <p>Subdistrict</p>
              <Input
                inputField={{
                  type: "text",
                  name: "subdistrict",
                  isRequired: true,
                  readOnly: true,
                }}
                value={address?.subdistrict as string}
                isError={false}
                onChange={Noop}
              />
              <p>Address</p>
              <Input
                inputField={{
                  type: "text",
                  name: "address",
                  isRequired: true,
                  readOnly: true,
                }}
                value={address?.address as string}
                isError={false}
                onChange={Noop}
              />
            </>
          )}
          <Checkbox
            label="Main"
            defaultValue={initialAddress?.is_main ?? false}
            onChange={(val) => {
              handleInputOnChange("isMain", val, "");
            }}
          />
          <div className={`h-[60px] w-full`}>
            {inputFields.map(
              (inputField) =>
                inputValues[inputField.name]?.error.length > 0 && (
                  <p
                    key={inputField.name}
                    className="text-[14px] font-[500] leading-[20px] text-left"
                  >
                    <strong className="text-[#F60707] font-[600]">*</strong>
                    {inputValues[inputField.name]?.error}
                  </p>
                )
            )}
          </div>
          <Button
            type="button"
            buttonStyle="blue"
            onClick={initialAddress ? handleEditAddress : handleAddAddress}
            disabled={isFilled ? false : disableSubmit}
            additionalClassName="py-2 px-3 rounded-lg"
          >
            Save
          </Button>
          {isFilled && (
            <p
              className="text-center cursor-pointer"
              onClick={() => {
                dispatch(resetState());
                onManualAdd();
              }}
            >
              Incorrect? Fill in the address manually
            </p>
          )}
        </div>
      </div>
    </form>
  );
};

export default AddressForm;
