import React, { FormEvent, useState } from "react";
import { IInputField } from "../interfaces/InputField";
import Input from "./Input";

type FormProps = {
  inputFields: IInputField[];
  submitButtonText: string;
  onSubmit: (inputValues: {
    [key: string]: { value: string; error: string; file?: File };
  }) => void;
};

const Form = ({
  inputFields,
  submitButtonText,
  onSubmit,
}: FormProps): React.ReactElement => {
  const [inputValues, setInputValues] = useState<{
    [key: string]: { value: string; error: string; file?: File };
  }>({});

  const [disableSubmit, setDisableSubmit] = useState<boolean>(true);

  function handleSetInputValues(
    key: string,
    value: string,
    error: string,
    file?: File
  ) {
    setInputValues((prevInputValues) => {
      const updatedValue = {
        ...prevInputValues,
        [key]: { value, error, file },
      };
      handleSetDisableSubmit(updatedValue);

      return updatedValue;
    });
  }

  function handleSetDisableSubmit(value: {
    [key: string]: { value: string; error: string; file?: File };
  }) {
    let allClear = true;

    inputFields.forEach((inputField) => {
      if (!value[inputField.name]) {
        allClear = false;
      }

      if (value[inputField.name]?.error != "") {
        allClear = false;
      }
    });

    setDisableSubmit(!allClear);
  }

  function handleInputOnChange(
    key: string,
    value: string,
    error: string,
    file?: File
  ) {
    handleSetInputValues(key, value, error, file);
  }

  function handleOnSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    onSubmit(inputValues);
  }

  return (
    <>
      <form
        className="flex flex-col gap-[5px] w-[100%]"
        onSubmit={(e) => handleOnSubmit(e)}
      >
        {inputFields.map((inputField) => (
          <Input
            key={inputField.name}
            inputField={inputField}
            value={inputValues[inputField.name]?.value}
            isError={inputValues[inputField.name]?.error.length > 0}
            onChange={(value, error, file) =>
              handleInputOnChange(inputField.name, value, error, file)
            }
          ></Input>
        ))}

        <div className={`h-[60px]`}>
          {inputFields.map(
            (inputField) =>
              inputField.name != "confirmPassword" &&
              inputValues[inputField.name]?.error.length > 0 && (
                <p
                  key={inputField.name}
                  className="text-[14px] font-[500] leading-[20px]"
                >
                  <strong className="text-[#F60707] font-[600]">*</strong>
                  {inputValues[inputField.name]?.error}
                </p>
              )
          )}
        </div>
        <button
          className="bg-[#000D44] text-white font-[600] outline-0 border-0 w-[110px] h-[33px] rounded-[10px] disabled:opacity-65"
          disabled={disableSubmit}
        >
          {submitButtonText}
        </button>
      </form>
    </>
  );
};

export default Form;
