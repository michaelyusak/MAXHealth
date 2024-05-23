import React, { useContext, useState } from "react";
import verificationIcon from "../assets/img/verification-icon.png";
import { IInputField } from "../interfaces/InputField";
import Form from "../components/Form";
import { HandleVerifyPassword } from "../util/API";
import { useLocation, useNavigate } from "react-router-dom";
import { HandleShowToast } from "../util/ShowToast";
import { ToastContext } from "../contexts/ToastData";
import { jwtDecode } from "jwt-decode";
import { IToken } from "../interfaces/Token";
import { GoVerified } from "react-icons/go";

const VerificationPage = (): React.ReactElement => {
  const navigate = useNavigate();

  const verificationInputFields: IInputField[] = [
    {
      name: "code",
      type: "text",
      placeholder: "6-digit code",
      isRequired: true,
      additionalClassName: "tracking-[4px] placeholder:tracking-[0px]",
      maxLength: 6,
      minLength: 6,
    },
    {
      name: "password",
      type: "password",
      placeholder: "Password",
      isRequired: true,
      withConfirmPassword: true,
    },
  ];

  const location = useLocation();
  const token = location.pathname.split("/").pop() ?? "";

  const { setToast } = useContext(ToastContext);

  function handleVerifyPassword(inputValues: {
    [key: string]: { value: string; error: string };
  }) {
    try {
      const payload = jwtDecode<IToken>(token);

      const data = JSON.parse(payload.data);
      const userId = data.user_id;

      const now = new Date().getTime() / 1000;
      if (!payload.exp || payload.exp < now) {
        throw new Error("token expired");
      }
      setIsLoading(true);

      HandleVerifyPassword(inputValues, userId)
        .then(() => {
          setIsVerified(true);
          HandleShowToast(setToast, true, "Verification success", 5);
        })
        .catch((error: Error) =>
          HandleShowToast(setToast, false, error.message, 5)
        )
        .finally(() => {
          setIsLoading(false);
        });
    } catch (error) {
      HandleShowToast(setToast, false, "Your account is not registered", 5);
    }
  }

  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <div
      className={`relative ${
        isVerified ? "w-[80%] lg:w-[30%] h-[35%]" : "w-[80%] lg:w-[25%] h-[62%]"
      } bg-white shadow-[0_5px_60px_-8px_rgba(0,0,0,0.3)] rounded-[10px] p-[30px] flex flex-col gap-[25px]`}
    >
      <div className={"h-[100%] flex items-center justify-center"}>
        {isVerified ? (
          <div className="w-[100%] h-[100%] justify-between flex flex-col items-center gap-[25px]">
            <div className="flex justify-center items-center h-[100px] w-[100px] rounded-[100%] bg-slate-200">
              <GoVerified className="h-[65px] w-[65px]"></GoVerified>
            </div>

            <h1 className="text-[30px] font-[600]">
              Your account has been verified!
            </h1>

            <button
              className="text-[20px] font-[600] px-[30px] py-[10px] border-2 border-black rounded-[8px]"
              onClick={() => navigate("/auth/login")}
            >
              Login
            </button>
          </div>
        ) : (
          <div className="w-[100%] flex flex-col items-center gap-[25px]">
            <div className="flex justify-center items-center h-[100px] w-[100px] rounded-[100%] bg-slate-200">
              <img
                alt=""
                src={verificationIcon}
                className="h-[65px] w-[65px]"
              ></img>
            </div>

            <h1 className="text-[30px] font-[600]">Verification</h1>

            <article className="text-center">
              <p className="font-[600]">Input verification code here.</p>
            </article>

            <Form
              inputFields={verificationInputFields}
              submitButtonText="Verify"
              onSubmit={(inputValues) => handleVerifyPassword(inputValues)}
            ></Form>
          </div>
        )}
      </div>
      <div
        className={`${
          isLoading ? "" : "hidden"
        } absolute z-10 w-full h-full top-0 left-0 right-0 bottom-0 bg-[rgba(128,128,128,0.4)] rounded-[10px]`}
      />
    </div>
  );
};

export default VerificationPage;
