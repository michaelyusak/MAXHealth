import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IInputField } from "../interfaces/InputField";
import Form from "../components/Form";
import { HandleRegister } from "../util/API";
import { HandleShowToast } from "../util/ShowToast";
import { ToastContext } from "../contexts/ToastData";

const RegisterPage = (): React.ReactElement => {
  const navigate = useNavigate();

  const registerInputFields: IInputField[] = [
    {
      name: "name",
      type: "name",
      placeholder: "Full Name",
      isRequired: true,
    },
    {
      name: "email",
      type: "email",
      placeholder: "E-mail Address",
      isRequired: true,
    },
  ];

  const { setToast } = useContext(ToastContext);

  function handleRegisterUser(inputValues: {
    [key: string]: { value: string; error: string };
  }) {
    const email = inputValues["email"].value;
    const encodedEmail = btoa(email);

    setIsLoading(true);

    HandleRegister(inputValues)
      .then(() => {
        HandleShowToast(setToast, true, "Register success", 5);
        navigate(`/auth/verification/email/${encodedEmail}`);
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
    <>
      <div className="relative w-[80%] lg:w-[40%] h-[85%] lg:h-[100vh] lg:m-0 m-auto justify-center bg-white shadow-[0_5px_300px_10px_rgba(0,0,0,0.3)] rounded-[10px] p-[15px] md:p-[30px] xl:p-[50px] lg:p-[100px] flex flex-col gap-[15px] xl:gap-[25px]">
        <h1 className="text-[24px] md:text-[26px] xl:text-[30px] font-[600]">Register new account</h1>
        <article>
          <p className="text-[18px] md:text-[20px] xl:text-[20px] font-[600]">
            Maximize Your Health Journey With Max Health!
          </p>
          <p className="text-[16px] md:text-[18px] xl:text-[18px] font-[400]">
            chat with doctors and find your medicines all in one App
          </p>
        </article>

        <div className={"h-[30%] flex items-center justify-center"}>
          <Form
            inputFields={registerInputFields}
            submitButtonText="Register"
            onSubmit={(inputValues) => handleRegisterUser(inputValues)}
          ></Form>
        </div>

        <div className="flex flex-col gap-[5px]">
          <button
            className="text-[14px] xl:text-[16px] text-left font-[600] w-fit h-fit"
            onClick={() => navigate("/auth/doctors/register")}
          >
            Are you a doctor? Register as a doctor.
          </button>

          <button
            className="text-[14px] xl:text-[16px] font-[600] w-fit h-fit"
            onClick={() => navigate("/auth/login")}
          >
            Login to account.
          </button>
        </div>

        <div
          className={`${
            isLoading ? "" : "hidden"
          } absolute z-10 w-full h-full top-0 left-0 right-0 bottom-0 bg-[rgba(128,128,128,0.4)] rounded-[10px]`}
        />
      </div>
    </>
  );
};

export default RegisterPage;
