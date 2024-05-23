import React, { useContext, useEffect, useState } from "react";
import { IInputField } from "../interfaces/InputField";
import Form from "../components/Form";
import { HandleGet, HandleRegisterDoctor } from "../util/API";
import { useNavigate } from "react-router-dom";
import { HandleShowToast } from "../util/ShowToast";
import { ToastContext } from "../contexts/ToastData";
import ItemSelector from "../components/ItemSelector";
import { DoctorSpecialization } from "../interfaces/Doctor";

const RegisterDoctorPage = (): React.ReactElement => {
  const navigate = useNavigate();

  const registerDoctorInputFields: IInputField[] = [
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
    {
      name: "certificate",
      type: "file",
      isRequired: true,
      fileFormat: ["pdf"],
      placeholder: "Insert your certificate here",
    },
  ];

  const [doctorSpecialization, setDoctorSpecialization] = useState<
    DoctorSpecialization[]
  >([]);
  const [doctorSpecializationNames, setDoctorSpecializationNames] = useState<
    string[]
  >([]);
  const [selectedDoctorSpecialization, setSelectedDoctorSpecialization] =
    useState<string>("");

  function getSpecializationIdByName(name: string): number {
    let id: number = 0;

    doctorSpecialization.forEach((specialization) => {
      if (specialization.name == name) {
        id = specialization.id;
      }
    });

    return id;
  }

  useEffect(() => {
    const url =
      import.meta.env.VITE_DEPLOYMENT_URL + "/doctors/specializations";

    HandleGet<DoctorSpecialization[]>(url).then((responseData) => {
      setDoctorSpecialization(responseData);

      const newList: string[] = [];
      responseData.forEach((specialization) => {
        newList.push(specialization.name);
      });
      setDoctorSpecializationNames(newList);
    });
  }, []);

  const { setToast } = useContext(ToastContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  function handleRegisterDoctor(
    inputValues: {
      [key: string]: { value: string; error: string; file?: File };
    },
    specializationId: number
  ) {
    const email = inputValues["email"].value;
    const encodedEmail = btoa(email);

    setIsLoading(true);
    HandleRegisterDoctor(inputValues, specializationId)
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

  return (
    <div className="relative w-[80%] lg:w-[40%] h-[85%] lg:m-0 m-auto lg:h-[100vh] justify-center bg-white shadow-[0_5px_300px_10px_rgba(0,0,0,0.3)] rounded-[10px] p-[50px] lg:p-[100px] flex flex-col gap-[25px]">
      <h1 className="text-[24px] font-[600]">Register new account</h1>
      <article>
        <p className="text-[18px] font-[400]">
          Access to the most powerful tool in
        </p>
        <p className="text-[18px] font-[400]">
          the entire design and web industry.
        </p>
      </article>

      <div className={"flex flex-col gap-[10px] items-center justify-center"}>
        <ItemSelector
          items={doctorSpecializationNames}
          placeholder="Select your medical specialization"
          value={selectedDoctorSpecialization}
          setValue={(value) => setSelectedDoctorSpecialization(value)}
          buttonAdditionalClassname="w-full border-0 bg-slate-200 rounded-[30px]"
          optionsAdditionalClassname="top-[55px]"
          rounded="rounded-[30px]"
          height="50px"
          px="px-[1.25rem]"
          py="py-[1rem]"
          border="border-[1px]"
          borderColor="focus:border-[#14C57B]"
        ></ItemSelector>
        <Form
          inputFields={registerDoctorInputFields}
          submitButtonText="Register"
          onSubmit={(inputValues) =>
            handleRegisterDoctor(
              inputValues,
              getSpecializationIdByName(selectedDoctorSpecialization)
            )
          }
        ></Form>
      </div>

      <button
        className="text-[15px] font-[600] w-fit h-fit"
        onClick={() => navigate("/auth/login")}
      >
        Login to account
      </button>
      <div
        className={`${
          isLoading ? "" : "hidden"
        } absolute z-10 w-full h-full top-0 left-0 right-0 bottom-0 bg-[rgba(128,128,128,0.4)] rounded-[10px]`}
      />
    </div>
  );
};

export default RegisterDoctorPage;
