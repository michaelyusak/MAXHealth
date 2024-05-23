import React, { useState } from "react";
import Input from "./Input";
import { IInputField } from "../interfaces/InputField";
import {
  GoogleMapApiResponseToAddressRequest,
  IAddressRequest,
  IGoogleMapApiResponse,
} from "../interfaces/Address";

interface AddressSearchProps {
  inputField: IInputField;
  inputValue: {
    value: string | number | boolean;
    error: string;
  };
  onChange: (
    key: string,
    value: string | number | boolean,
    error: string
  ) => void;
  onSearch: (callback: (data: IGoogleMapApiResponse[]) => void) => void;
  onSelectOption: (opt: IAddressRequest) => void;
}

const AddressSearch = ({
  inputField,
  inputValue,
  onChange,
  onSearch,
  onSelectOption,
}: AddressSearchProps): React.ReactElement => {
  const [showAddressOptions, setShowAddressOptions] = useState<boolean>(false);
  const [addressOptions, setAddressOptions] = useState<IAddressRequest[]>([]);

  return (
    <div className="relative">
      <div className="w-full flex flex-row gap-[1rem]">
        <Input
          key={inputField.name}
          inputField={inputField}
          value={inputValue.value}
          isError={inputValue.error.length > 0}
          onChange={(value, error) => {
            onChange(inputField.name, value, error);
            if (value === "") {
              setAddressOptions([]);
              setShowAddressOptions(false);
            }
          }}
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            onSearch((data) => {
              const res: IAddressRequest[] = [];
              for (let index = 0; index < data.length; index++) {
                const item = data[index];
                res.push(GoogleMapApiResponseToAddressRequest(item));
              }
              setAddressOptions(res);
              setShowAddressOptions(true);
            });
          }}
          disabled={inputField.readOnly ?? false}
          className="disabled:cursor-text"
        >
          Search
        </button>
      </div>
      {inputValue.value !== "" && showAddressOptions && (
        <div className="absolute flex flex-col divide-y top-[55px] w-full bg-[#f6f7fb] border-[1px] border-[#D8DDE1] rounded-[8px] px-[1rem] max-h-[300px] overflow-y-auto">
          {addressOptions.length > 0 ? (
            addressOptions.map((opt, i) => (
              <div
                key={i}
                className="py-[1rem] cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  onSelectOption(opt);
                  setAddressOptions([]);
                  setShowAddressOptions(false);
                }}
              >
                {opt.address}
              </div>
            ))
          ) : (
            <div className="py-[1rem]">Address not found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddressSearch;
