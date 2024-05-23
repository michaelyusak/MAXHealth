import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { jwtDecode } from "jwt-decode";

import notFoundIcon from "../assets/img/not-found-icon.png";
import verificationIcon from "../assets/img/verification-icon.png";
import Form from "../components/Form";
import { ToastContext } from "../contexts/ToastData";
import { IInputField } from "../interfaces/InputField";
import { IToken } from "../interfaces/Token";
import { HandleResetPassword } from "../util/API";
import { HandleShowToast } from "../util/ShowToast";
import { GoVerified } from "react-icons/go";

const ResetPasswordPage = (): React.ReactElement => {
  const navigate = useNavigate();

  const resetPasswordInputFields: IInputField[] = [
    {
      name: "code",
      type: "text",
      placeholder: "6-digit code",
      isRequired: true,
      additionalClassName: "tracking-[4px]",
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

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isReset, setIsReset] = useState<boolean>(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean>(true);
  const [userId, setUserId] = useState<number>(0);

  function handleResetPassword(inputValues: {
    [key: string]: { value: string; error: string };
  }) {
    setIsLoading(true);
    try {
      HandleResetPassword(inputValues, userId)
        .then(() => {
          setIsReset(true);
          HandleShowToast(setToast, true, "Reset password success", 5);
        })
        .catch((error: Error) =>
          HandleShowToast(setToast, false, error.message, 5)
        );
    } catch (error) {
      HandleShowToast(setToast, false, "Your account is not registered", 5);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const payload = jwtDecode<IToken>(token);
    const data = JSON.parse(payload.data);

    const now = new Date().getTime() / 1000;
    if (!payload.exp || payload.exp < now) {
      setIsTokenValid(false);
      return;
    }

    setUserId(data.user_id);
  }, [token]);

  return (
    <div
      className={`${
        !isTokenValid
          ? "w-[80%] lg:w-[30%] h-[45%]"
          : isReset
          ? "w-[80%] lg:w-[30%] h-[35%]"
          : "w-[80%] lg:w-[25%] h-[60%]"
      } relative bg-white shadow-[0_5px_60px_-8px_rgba(0,0,0,0.3)] rounded-[10px] p-[30px] flex flex-col gap-[25px]`}
    >
      <div className={"h-[100%] flex items-center justify-center"}>
        {!isTokenValid ? (
          <div className="w-[100%] h-[100%] justify-between flex flex-col items-center gap-[25px]">
            <div className="flex justify-center items-center h-[100px] w-[100px] rounded-[100%] bg-slate-200">
              <img
                alt=""
                src={notFoundIcon}
                className="h-[60px] w-[60px]"
              ></img>
            </div>{" "}
            <h1 className="text-[24px] font-[600]">This link is invalid.</h1>
            <p>
              If you received an email from us to reset your password, please
              either try the link provided there again or double check that this
              URL matches.
            </p>
            <button
              className="text-[20px] font-[600] px-[30px] py-[10px] border-2 border-black rounded-[8px]"
              onClick={() => navigate("/reset-password")}
            >
              Request reset password
            </button>
          </div>
        ) : isReset ? (
          <div className="w-[100%] h-[100%] justify-between flex flex-col items-center gap-[25px]">
            <div className="flex justify-center items-center h-[100px] w-[100px] rounded-[100%] bg-slate-200">
              <GoVerified className="h-[65px] w-[65px]"></GoVerified>
            </div>

            <h1 className="text-[24px] font-[600]">
              Your account password has been reset!
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

            <h1 className="text-[24px] font-[600]">Reset Password</h1>

            <article className="text-center">
              <p>Input verification code here.</p>
            </article>

            <Form
              inputFields={resetPasswordInputFields}
              submitButtonText="Submit"
              onSubmit={(inputValues) => handleResetPassword(inputValues)}
            />
          </div>
        )}
      </div>
      <div
        className={`${
          isLoading ? "" : "hidden"
        } absolute z-10 w-full h-full top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.2)] rounded-[10px]`}
      />
    </div>
  );
};

export default ResetPasswordPage;
