import React, { ChangeEvent, useContext, useRef, useState } from "react";
import { IInputField } from "../interfaces/InputField";
import { EmailRegex, NameRegex, PasswordRegex } from "../util/Regex";
import { HandleShowToast } from "../util/ShowToast";
import { ToastContext } from "../contexts/ToastData";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

type InputProps = {
  inputField: IInputField;
  value: string | number | boolean;
  isError: boolean;
  onChange: (value: string, error: string, file?: File) => void;
};

const Input = ({
  inputField,
  value,
  isError,
  onChange,
}: InputProps): React.ReactElement => {
  const { setToast } = useContext(ToastContext);

  const inputFile = useRef<HTMLInputElement>(null);

  const [certificate, setCertificate] = useState<{
    name: string;
    size: number;
  }>({ name: "", size: 0 });

  function handleSetCertificate(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files !== null) {
      const file = e.target.files[0];
      setCertificate({ name: file.name, size: file.size });
    }
  }

  function handleRemoveCertificate() {
    if (inputFile.current) {
      inputFile.current;
      inputFile.current.value = "";
      inputFile.current.type = "text";
      inputFile.current.type = "file";
    }

    setCertificate({ name: "", size: 0 });
  }

  function handleNameChange(e: ChangeEvent<HTMLInputElement>) {
    let errorMsg = "";

    if (!NameRegex.test(e.target.value)) {
      errorMsg = "Name is invalid";
    }

    if (e.target.value == "" && inputField.isRequired) {
      errorMsg = "Name is required";
    }

    handleChange(e, errorMsg);
  }

  function handleEmailChange(e: ChangeEvent<HTMLInputElement>) {
    let errorMsg = "";

    if (!EmailRegex.test(e.target.value)) {
      errorMsg = "Email is invalid";
    }

    if (e.target.value == "" && inputField.isRequired) {
      errorMsg = "Email is required";
    }

    handleChange(e, errorMsg);
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
      inputField.fileFormat &&
      fileFormat &&
      !inputField.fileFormat.includes(fileFormat)
    ) {
      errorMsg = `File must be in ${inputField.fileFormat} format`;
      HandleShowToast(setToast, false, errorMsg, 5);
      return;
    }

    if (inputField.maxFileSize && fileSize > inputField.maxFileSize) {
      errorMsg = `File must not be greater than ${inputField.maxFileSize}`;
      HandleShowToast(setToast, false, errorMsg, 5);
      return;
    }

    onChange("", errorMsg, file);
    handleSetCertificate(e);
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    let errorMsg = "";

    if (
      (e.target.value == "" && inputField.isRequired) ||
      e.target.validationMessage != ""
    ) {
      errorMsg = `${inputField.name} is invalid`;
    }
    handleChange(e, errorMsg);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>, error: string) {
    if (inputField.maxLength && e.target.value.length > inputField.maxLength) {
      return;
    }

    if (inputField.minLength && e.target.value.length < inputField.minLength) {
      error = `Code must be ${inputField.minLength} digit`;
    }

    const value = e.target.value;

    onChange(value, error);
  }

  function handlePasswordChange(e: ChangeEvent<HTMLInputElement>) {
    const pwd = e.target.value;

    CheckPassword(pwd, confirmPassword.value);
  }

  function CheckPassword(pwd: string, confirmPwd: string) {
    let errorMsg = "";

    if (inputField.withConfirmPassword && pwd != confirmPwd) {
      errorMsg = "Password must match confirm password";
    }

    if (!inputField.isForLogin && !PasswordRegex.test(pwd)) {
      errorMsg =
        "Password must contain at least 8 characters with minimal 1 uppercase letter, 1 lowercase letter, and 1 number.";
    }

    if (inputField.isRequired && pwd == "") {
      errorMsg = "Password is required.";
    }

    onChange(pwd, errorMsg);
  }

  const [confirmPassword, setConfirmPassword] = useState<{
    value: string;
    error: string;
  }>({ value: "", error: "" });

  function handleConfirmPasswordChange(e: ChangeEvent<HTMLInputElement>) {
    let errorMsg = "";
    const confirmPwd = e.target.value;

    if (!PasswordRegex.test(confirmPwd)) {
      errorMsg = "invalid password";
    }

    if (confirmPwd != value) {
      errorMsg = "Password must match confirm password";
    }

    setConfirmPassword({ value: confirmPwd, error: errorMsg });
    CheckPassword(String(value), confirmPwd);
  }

  const [showPassword, setShowPassword] = useState<boolean>(false);
  function handleSetShowPassword() {
    setShowPassword(!showPassword);
  }

  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  function handleSetShowConfirmPassword() {
    setShowConfirmPassword(!showConfirmPassword);
  }

  const [selectedBinary, setSelectedBinary] = useState<number>(
    Number(value) ?? 0
  );
  return (
    <>
      {inputField.type == "password" || inputField.type == "confirmPassword" ? (
        <>
          <div className="w-full">
            <div
              className={`flex items-center justify-between w-full bg-slate-200 border-[1px] border-[#f6f7fb] outline-0 tracking-[3px] placeholder:text-[#000D44] placeholder:tracking-[0px] text-[#000D44] rounded-[30px] px-[1.25rem] py-[1rem] ${
                isError
                  ? "focus-within:border-[#F60707] bg-[#fb9c9c]"
                  : "focus-within:border-[#1F5FFF]"
              } ${inputField.additionalClassName}`}
            >
              <input
                type={showPassword ? "text" : "password"}
                className={`w-[100%] text-black bg-transparent outline-0 tracking-[3px] placeholder:text-black placeholder:tracking-[0px] ${inputField.additionalClassName}`}
                placeholder={inputField.placeholder}
                value={value as string}
                onChange={(e) => handlePasswordChange(e)}
              ></input>
              <button type="button" onClick={() => handleSetShowPassword()}>
                {showPassword ? (
                  <FaEye className="h-[20px]"></FaEye>
                ) : (
                  <FaEyeSlash className="h-[22px]"></FaEyeSlash>
                )}
              </button>
            </div>
          </div>
          {inputField.withConfirmPassword && (
            <div className="w-full">
              <div
                className={`flex items-center justify-between w-full bg-slate-200 border-[1px] border-[#f6f7fb] outline-none tracking-[3px] placeholder:text-[#000D44] placeholder:tracking-[0px] text-[#000D44] rounded-[30px] px-[1.25rem] py-[1rem] ${
                  isError
                    ? "focus-within:border-[#F60707] bg-[#fb9c9c]"
                    : "focus-within:border-[#D8DDE1]"
                } ${inputField.additionalClassName}`}
              >
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`w-[100%] text-black bg-transparent focus:outline-0 tracking-[3px] placeholder:text-black placeholder:tracking-[0px] ${inputField.additionalClassName}`}
                  placeholder={"Confirm Password"}
                  value={confirmPassword.value}
                  onChange={(e) => handleConfirmPasswordChange(e)}
                ></input>
                <button
                  type="button"
                  onClick={() => handleSetShowConfirmPassword()}
                >
                  {showConfirmPassword ? (
                    <FaEye className="h-[20px]"></FaEye>
                  ) : (
                    <FaEyeSlash className="h-[22px]"></FaEyeSlash>
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      ) : inputField.type == "file" ? (
        <>
          {!certificate.name ? (
            <>
              <input
                type="file"
                className="hidden"
                key={inputField.name}
                ref={inputFile}
                id={`inputfile${inputField.name}`}
                onChange={(e) => handleFileChange(e)}
                required={inputField.isRequired}
              ></input>
              <label htmlFor={`inputfile${inputField.name}`}>
                <div
                  className={`w-[50%] hover:translate-x-px bg-slate-200 border-[1px] outline-0 text-[#000D44] rounded-[30px] px-[1.25rem] py-[1rem] cursor-pointer ${
                    isError
                      ? "focus:border-[#F60707] bg-[#fb9c9c]"
                      : "focus:border-[#14C57B]"
                  } ${inputField.additionalClassName}`}
                >
                  {inputField.placeholder}
                </div>
              </label>
            </>
          ) : (
            <>
              <div className="flex gap-[10px] py-[1rem] px-[1.25rem] bg-slate-200 border-[1px] outline-0 border-[#14C57B] rounded-[30px] justify-between items-center">
                <p className="h-[100%] w-[80%] text-left truncate">
                  {certificate.name}
                </p>
                <p className="w-[20%] text-right">
                  {(certificate.size / 1000).toFixed(2)}
                  <b className="font-[600] text-[#1F5FFF]">kB</b>
                </p>
                <button
                  onClick={() => handleRemoveCertificate()}
                  className="px-[10px]"
                >
                  <IoMdClose></IoMdClose>
                </button>
              </div>
            </>
          )}
        </>
      ) : inputField.type == "binary" ? (
        <div className={`flex items-center w-full outline-none text-[#000D44]`}>
          {inputField.options?.map((opt, i) => (
            <div
              key={i}
              className={`w-full ${
                selectedBinary === opt.value ? "bg-[#C2D4FF]" : "bg-[#f6f7fb]"
              } px-[1.25rem] py-[1rem] ${
                i === 0 ? "rounded-l-[30px]" : "rounded-r-[30px]"
              } cursor-pointer border-[1px] border-[#f6f7fb] text-center`}
              onClick={() => {
                onChange(String(opt.value), "");
                setSelectedBinary(opt.value);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col w-full">
          <input
            className={`w-full bg-slate-200 border-[1px] border-[#f6f7fb] outline-0 tracking-[3px] placeholder:text-[#000D44] placeholder:tracking-[0px] text-[#000D44] rounded-[30px] px-[1.25rem] py-[1rem] ${
              inputField.readOnly
                ? "text-[#808183] placeholder:text-[#808183] focus:border-[#f6f7fb]"
                : ""
            } ${
              isError
                ? "focus:border-[#F60707] bg-[#fb9c9c]"
                : "focus:border-[#14C57B]"
            } ${inputField.additionalClassName}`}
            type={
              inputField.type == "email" || inputField.type == "name"
                ? "text"
                : inputField.type
            }
            placeholder={inputField.placeholder}
            required={inputField.isRequired}
            value={value as string | number}
            onChange={(e) =>
              inputField.type == "email"
                ? handleEmailChange(e)
                : inputField.type == "name"
                ? handleNameChange(e)
                : handleInputChange(e)
            }
            onBlur={(e) => inputField.type == "name" && handleNameChange(e)}
            readOnly={inputField.readOnly}
          ></input>
        </div>
      )}
    </>
  );
};

export default Input;
