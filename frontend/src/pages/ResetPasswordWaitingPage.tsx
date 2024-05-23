import React, { useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import { HandleResetPasswordRequest } from "../util/API";
import { HandleShowToast } from "../util/ShowToast";
import { ToastContext } from "../contexts/ToastData";
import { BiMailSend } from "react-icons/bi";

const ResetPasswordWaitingPage = (): React.ReactElement => {
  const location = useLocation();
  const encodedEmail = location.pathname.split("/").pop() ?? "";
  const email = atob(encodedEmail);

  const { setToast } = useContext(ToastContext);

  function handleResendEmail() {
    setIsLoading(true);
    HandleResetPasswordRequest(email)
      .then(() => {
        HandleShowToast(
          setToast,
          true,
          "an email has been sent to your email address",
          5
        );
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 5);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <div className="relative w-[80%] lg:w-[20%] h-[50%] bg-white shadow-[0_5px_60px_-8px_rgba(0,0,0,0.3)] rounded-[10px] p-[30px] flex flex-col gap-[25px]">
      <div className={"h-[100%] flex items-center justify-center"}>
        <div className="flex flex-col items-center gap-[25px]">
          <div className="flex justify-center items-center h-[100px] w-[100px] rounded-[100%] bg-slate-200">
            <BiMailSend className="h-[65px] w-[65px]"></BiMailSend>
          </div>

          <h1 className="text-[24px] font-[600]">Reset Password Request</h1>

          <article className="text-center">
            <p>Verification email has been sent to your registered email.</p>
            <p>
              Please check your inbox and click the button to reset your
              password.
            </p>
          </article>

          <div className="text-center">
            <p className="text-[16px]">Didn't receive an email?</p>
            <button
              className="underline text-[16px] font-[600]"
              onClick={() => handleResendEmail()}
            >
              Resend verification email
            </button>
          </div>
        </div>
      </div>
      <div
        className={`${
          isLoading ? "" : "hidden"
        } absolute z-10 w-full h-full top-0 left-0 right-0 bottom-0 bg-[rgba(128,128,128,0.4)] rounded-[10px]`}
      />
    </div>
  );
};

export default ResetPasswordWaitingPage;
