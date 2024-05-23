import React, { ChangeEvent, useContext, useState } from "react";

import { ToastContext } from "../contexts/ToastData";
import { IInputField } from "../interfaces/InputField";
import { IProfile } from "../interfaces/Profile";
import { HandlePatchFormData } from "../util/API";
import { HandleShowToast } from "../util/ShowToast";
import Button from "./Button";
import Input from "./Input";
import { useNavigate } from "react-router-dom";
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";

type EditProfileFormProps = {
  profile: IProfile | undefined;
  onSubmit: () => void;
};

const EditProfileForm = ({
  profile,
  onSubmit,
}: EditProfileFormProps): React.ReactElement => {
  const navigate = useNavigate();

  const [showPasswordInput, setShowPasswordInput] = useState<boolean>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [inputValues, setInputValues] = useState<{
    [key: string]: {
      value: string | number;
      error: string;
      file?: File | undefined;
    };
  }>({
    picture: {
      value: "",
      error: "",
      file: undefined,
    },
    email: {
      value: profile?.email ?? "",
      error: "",
    },
    name: {
      value: profile?.name ?? "",
      error: "",
    },
    gender: {
      value: profile?.gender_id ?? 0,
      error: "",
    },
    dateOfBirth: {
      value: profile?.date_of_birth ?? "",
      error: "",
    },
    password: {
      value: "",
      error: "",
    },
  });

  const { setToast } = useContext(ToastContext);

  const inputFields: IInputField[] = [
    {
      name: "email",
      type: "email",
      placeholder: "E-mail Address",
      isRequired: true,
      readOnly: true,
    },
    {
      name: "name",
      type: "name",
      placeholder: "Full Name",
      isRequired: true,
    },
    {
      name: "gender",
      type: "binary",
      placeholder: "Gender",
      isRequired: true,
      options: [
        { label: "Male", value: 1 },
        { label: "Female", value: 2 },
      ],
    },
    {
      name: "dateOfBirth",
      type: "date",
      placeholder: "Date of Birth",
      isRequired: true,
    },
    {
      name: "password",
      type: "password",
      placeholder: "Password",
      isRequired: true,
      withConfirmPassword: true,
    },
  ];

  const fileInputField: IInputField = {
    name: "picture",
    type: "file",
    isRequired: true,
    fileFormat: ["png", "jpg", "jpeg"],
    placeholder: "Choose picture",
  };

  const [disableSubmit, setDisableSubmit] = useState<boolean>(true);

  function handleSetDisableSubmit(value: {
    [key: string]: { value: string | number; error: string; file?: File };
  }) {
    let isError = false;
    let areFieldChanges = false;

    if (value["picture"].file && value["picture"]?.error == "") {
      areFieldChanges = true;
    }
    for (const inputField of inputFields) {
      if (value[inputField.name]?.error !== "") {
        isError = true;
        break;
      }

      if (
        inputField.name === "name" &&
        value[inputField.name].value !== profile?.name
      ) {
        areFieldChanges = true;
      }

      if (
        inputField.name === "gender" &&
        value[inputField.name].value != profile?.gender_id
      ) {
        areFieldChanges = true;
      }

      if (
        inputField.name === "dateOfBirth" &&
        value[inputField.name].value !== profile?.date_of_birth
      ) {
        areFieldChanges = true;
      }

      if (
        inputField.name === "password" &&
        value[inputField.name].value !== ""
      ) {
        areFieldChanges = true;
      }
    }
    if (
      value["gender"].value === "" ||
      value["dateOfBirth"].value === "" ||
      isError ||
      !areFieldChanges
    ) {
      setDisableSubmit(true);
      return;
    }
    setDisableSubmit(false);
  }

  function handleInputOnChange(
    key: string,
    value: string | number,
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

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) {
      return;
    }

    const file = e.target.files[0];

    const fileName = file.name;
    const fileSize = file.size;

    let errorMsg = "";

    const fileFormat = fileName.split(".").pop();

    if (
      !(
        fileInputField.fileFormat &&
        fileFormat &&
        fileInputField.fileFormat.includes(fileFormat)
      )
    ) {
      errorMsg = `File must be in ${fileInputField.fileFormat} format`;
      HandleShowToast(setToast, false, errorMsg, 5);
      return;
    }

    if (fileInputField.maxFileSize && fileSize > fileInputField.maxFileSize) {
      errorMsg = `File must not be greater than ${fileInputField.maxFileSize}`;
      HandleShowToast(setToast, false, errorMsg, 5);
      return;
    }

    handleInputOnChange("picture", "", errorMsg, file);
  }

  function handleEditProfile() {
    setIsLoading(true);

    const name = inputValues["name"].value;
    const email = inputValues["email"].value;
    const password = inputValues["password"].value;
    const genderId = Number(inputValues["gender"].value);
    const dateOfBirth = inputValues["dateOfBirth"].value;

    const profilePicture = inputValues["picture"].file;

    const formData = new FormData();

    const data = {
      name: name,
      email: email,
      password: password,
      gender_id: genderId,
      date_of_birth: dateOfBirth,
    };

    formData.append("data", JSON.stringify(data));
    formData.append("file", profilePicture ?? "");

    const url = import.meta.env.VITE_DEPLOYMENT_URL +  "/users/profile";

    HandlePatchFormData(formData, url, true)
      .then((responseData) => {
        if (!responseData) {
          return;
        }

        HandleShowToast(setToast, true, "Edit profile success", 5);
        onSubmit();
      })
      .catch((error: Error) => {
        if (error.message == MsgRefreshTokenNotFound) {
          navigate("/auth/login");
        }
        HandleShowToast(setToast, false, error.message, 5);
      })
      .finally(() => setIsLoading(false));
  }

  return (
    <div>
      <form className="flex flex-col gap-[5px] w-[100%]">
        <div className="w-[100%] h-[100%] justify-between flex flex-col items-center gap-[20px]">
          <div className="flex flex-col items-center gap-[0.75rem]">
            <div className="flex justify-center items-center h-[120px] w-[120px] rounded-full">
              <img
                alt=""
                src={
                  inputValues["picture"].file !== undefined
                    ? URL.createObjectURL(inputValues["picture"].file)
                    : profile?.profile_picture
                }
                className="h-[120px] w-[120px] object-cover rounded-full"
              ></img>
            </div>
            <input
              type="file"
              className="hidden"
              key={fileInputField.name}
              id={`inputfile${fileInputField.name}`}
              onChange={(e) => handleFileChange(e)}
              required={fileInputField.isRequired}
            ></input>
            <label htmlFor={`inputfile${fileInputField.name}`}>
              <p className="cursor-pointer text-[#1F5FFF]">
                {fileInputField.placeholder}
              </p>
            </label>
          </div>
          {inputFields.map((inputField) => (
            <div key={inputField.name} className="w-full">
              {inputField.name === "password" && (
                <div className="w-full">
                  <p
                    className="cursor-pointer text-[#1F5FFF]"
                    onClick={() => {
                      setShowPasswordInput(!showPasswordInput);
                      setInputValues((prevInputValues) => {
                        const updatedValue = {
                          ...prevInputValues,
                          password: { value: "", error: "", file: undefined },
                        };
                        handleSetDisableSubmit(updatedValue);

                        return updatedValue;
                      });
                    }}
                  >
                    {showPasswordInput
                      ? "Cancel edit password"
                      : "Edit password"}
                  </p>
                </div>
              )}
              <div className="w-full flex flex-col gap-[1rem]">
                {inputField.name !== "password" && (
                  <p>{inputField.placeholder}</p>
                )}
                {(inputField.name !== "password" || showPasswordInput) && (
                  <Input
                    key={inputField.name}
                    inputField={inputField}
                    value={inputValues[inputField.name]?.value}
                    isError={inputValues[inputField.name]?.error.length > 0}
                    onChange={(value, error, file) =>
                      handleInputOnChange(inputField.name, value, error, file)
                    }
                  />
                )}
              </div>
            </div>
          ))}
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
            onClick={handleEditProfile}
            disabled={disableSubmit}
            additionalClassName="py-2 px-3 rounded-lg"
          >
            Save
          </Button>
        </div>
      </form>
      <div
        className={`${
          isLoading ? "" : "hidden"
        } absolute z-10 w-full h-full top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.2)] rounded-[10px]`}
      />
    </div>
  );
};

export default EditProfileForm;
