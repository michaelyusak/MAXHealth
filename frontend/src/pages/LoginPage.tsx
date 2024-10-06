import React, { useContext, useState } from "react";

import Cookies from "js-cookie";

import { IInputField } from "../interfaces/InputField";
import Form from "../components/Form";
import {
  HandleGet,
  HandleLogin,
  HandleSendVerificationEmail,
} from "../util/API";
import { ToastContext } from "../contexts/ToastData";
import { HandleShowToast } from "../util/ShowToast";
import { useNavigate } from "react-router-dom";
import { path } from "../router/path";
import { jwtDecode } from "jwt-decode";
import { IToken } from "../interfaces/Token";
import { IAddress } from "../interfaces/Address";
import { MsgAccountNotVerified } from "../appconstants/appconstants";

const LoginPage = (): React.ReactElement => {
  const navigate = useNavigate();
  const loginInputFields: IInputField[] = [
    {
      name: "email",
      type: "email",
      placeholder: "Email",
      isRequired: true,
      isForLogin: true,
    },
    {
      name: "password",
      type: "password",
      placeholder: "Password",
      isRequired: true,
      isForLogin: true,
    },
  ];

  const { setToast } = useContext(ToastContext);

  const setAddress = async (accessTokenClaims: IToken) => {
    const dataParsed = JSON.parse(accessTokenClaims.data);

    const roleName = dataParsed["role"];

    if (roleName == "user") {
      const url = import.meta.env.VITE_DEPLOYMENT_URL + "/address";

      HandleGet<{ address: IAddress[] }>(url, true).then((responseData) => {
        const userAddress = responseData.address;

        const location: { lat: string; long: string } = { lat: "", long: "" };
        userAddress.forEach((address) => {
          if (address.is_main) {
            location.lat = address.latitude;
            location.long = address.longitude;
          }
        });

        const storeData = {
          ...dataParsed,
          location: {
            lat: location.lat,
            long: location.long,
          },
        };

        Cookies.set("data", JSON.stringify(storeData));

        navigate("/");
      });

      return;
    }

    Cookies.set("data", JSON.stringify(dataParsed));

    switch (roleName) {
      case "user":
        navigate("/");
        break;
      case "admin":
        navigate("/admin");
        break;
      case "pharmacy manager":
        navigate("/manager");
        break;
      case "doctor":
        navigate("/doctors/");
        break;
    }
  };

  function handleLogin(inputValues: {
    [key: string]: { value: string; error: string };
  }) {
    setIsLoading(true);

    HandleLogin(inputValues)
      .then(async (responseData) => {
        const accessToken = responseData["access_token"];
        const accessTokenClaims = jwtDecode<IToken>(accessToken);

        const resfreshToken = responseData["refresh_token"];
        const refreshTokenClaims = jwtDecode<IToken>(resfreshToken);

        Cookies.set("accessToken", accessToken, {
          expires: new Date(accessTokenClaims.exp * 1000),
        });

        Cookies.set("refreshToken", resfreshToken, {
          expires: new Date(refreshTokenClaims.exp * 1000),
        });

        await setAddress(accessTokenClaims);
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
      .finally(() => {
        setIsLoading(false);
      });
  }

  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <div className="relative w-[80%] lg:w-[40%] lg:h-[100vh] m-auto lg:m-0 bg-white shadow-[0_5px_300px_10px_rgba(0,0,0,0.3)] rounded-[10px] p-[15px] md:p-[30px] xl:p-[50px] lg:p-[100px] flex flex-col justify-center gap-[10px] xl:gap-[25px]">
      <h1 className="text-[24px] md:text-[26px] xl:text-[30px] font-[600]">Login to account</h1>
      <article>
        <p className="text-[18px] md:text-[20px] xl:text-[20px] font-[600]">
          Maximize Your Health Journey With Max Health!
        </p>
        <p className="text-[16px] md:text-[18px] xl:text-[18px] font-[400]">
          chat with doctors and find your medicines all in one App
        </p>
      </article>

      <Form
        inputFields={loginInputFields}
        submitButtonText="Login"
        onSubmit={(inputValues) => handleLogin(inputValues)}
      ></Form>

      <div className="flex flex-col gap-[10px]">
        <button
          className="text-[14px] xl:text-[16px] font-[600] w-fit h-fit"
          onClick={() => navigate(path.resetPassword)}
        >
          Forgot password?
        </button>
        <button
          className="text-[14px] xl:text-[16px] font-[600] w-fit h-fit"
          onClick={() => navigate("/auth/register")}
        >
          Create an account
        </button>
      </div>
      <div
        className={`${
          isLoading ? "" : "hidden"
        } absolute z-10 w-full h-full top-0 left-0 right-0 bottom-0 bg-[rgba(128,128,128,0.4)] rounded-[10px]`}
      />
    </div>
  );
};

export default LoginPage;
