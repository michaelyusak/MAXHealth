import React, { useContext, useState } from "react";
import verificationIcon from "../assets/img/verification-icon.png";
import { IInputField } from "../interfaces/InputField";
import Form from "../components/Form";
import {
  HandleResetPasswordRequest,
  HandleSendVerificationEmail,
} from "../util/API";
import { useNavigate } from "react-router-dom";
import { HandleShowToast } from "../util/ShowToast";
import { ToastContext } from "../contexts/ToastData";
import { MsgAccountNotVerified } from "../appconstants/appconstants";

const ResetPasswordRequestPage = (): React.ReactElement => {
  const navigate = useNavigate();

  const resetPasswordRequestInputFields: IInputField[] = [
    {
      name: "email",
      type: "email",
      placeholder: "E-mail Address",
      isRequired: true,
    },
  ];

  const { setToast } = useContext(ToastContext);

  function handleResetPasswordRequest(inputValues: {
    [key: string]: { value: string; error: string };
  }) {
    setIsLoading(true);
    const email = inputValues["email"].value;
    const encodedEmail = btoa(email);

    HandleResetPasswordRequest(email)
      .then(() => {
        HandleShowToast(setToast, true, "Reset password request sent", 5);
        navigate(`/reset-password/${encodedEmail}`);
      })
      .catch((error: Error) => {
        if (error.message.includes(MsgAccountNotVerified)) {
          const email = inputValues["email"].value;
          const encodedEmail = btoa(email);

          HandleSendVerificationEmail(email)
            .then(() => {
              navigate(`/auth/verification/email/${encodedEmail}`);
              HandleShowToast(
                setToast,
                true,
                "Your account has not been verified. A verification email has been sent.",
                5
              );
            })
            .catch((error: Error) => {
              HandleShowToast(
                setToast,
                false,
                `Your account has not been verified. Failed to sent verification email, ${error.message}`,
                5
              );
            });

          return;
        }

        HandleShowToast(setToast, false, error.message, 5);
      })
      .finally(() => setIsLoading(false));
  }

  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <div
      className={
        "relative w-[80%] lg:w-[25%] h-[60%] bg-white shadow-[0_5px_60px_-8px_rgba(0,0,0,0.3)] rounded-[10px] p-[30px] flex flex-col gap-[25px]"
      }
    >
      <div className={"h-[100%] flex items-center justify-center"}>
        <div className="w-[100%] flex flex-col items-center gap-[25px]">
          <div className="flex justify-center items-center h-[100px] w-[100px] rounded-[100%] bg-slate-200">
            <img
              alt=""
              src={verificationIcon}
              className="h-[65px] w-[65px]"
            ></img>
          </div>

          <h1 className="text-[30px] font-[600]">Reset Password Request</h1>

          <article className="text-center">
            <p className="font-[600]">Input your email account here.</p>
          </article>

          <Form
            inputFields={resetPasswordRequestInputFields}
            submitButtonText="Submit"
            onSubmit={(inputValues) => handleResetPasswordRequest(inputValues)}
          />
        </div>
      </div>
      <div
        className={`${
          isLoading ? "" : "hidden"
        } absolute z-10 w-full h-full top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.2)] rounded-[10px]`}
      />
    </div>
  );
};

export default ResetPasswordRequestPage;
