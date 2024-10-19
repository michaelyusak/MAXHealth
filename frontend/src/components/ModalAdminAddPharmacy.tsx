import React, { useContext, useState } from "react";
import { HandleAddRaw } from "../util/API";
import { ToastContext } from "../contexts/ToastData";
import { HandleShowToast } from "../util/ShowToast";
import { NameRegex } from "../util/Regex";
import { IconContext } from "react-icons";
import { IoClose } from "react-icons/io5";

type modalProps = {
  onClose: (type: string) => void;
  data: Partner | undefined;
  onFetch: () => void;
};

type Partner = {
  id: number;
  name: string;
  email: string;
  profile_picture: string;
};

const ModalAdminAddPharmacy = ({
  onClose,
  data,
  onFetch,
}: modalProps): React.ReactElement => {
  const [input, setInput] = useState<string>("");
  const [didEdit, setDidEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setToast } = useContext(ToastContext);

  function handleInputBlur() {
    setDidEdit(true);
  }

  const handleClose = () => {
    setInput("");
    onClose("addPharmacy");
  };

  const nameIsInvalid = didEdit && !NameRegex.test(input);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const url = import.meta.env.VITE_HTTP_BASE_URL + "/pharmacies";

    const body = {
      pharmacy_name: input,
      pharmacy_manager_id: data?.id,
    };

    setIsLoading(true);
    HandleAddRaw(url, JSON.stringify(body), true)
      .then(() => {
        HandleShowToast(setToast, true, "Add pharmacy success", 5);
        handleClose();
        onFetch();
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 5);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <div
        onKeyDown={() => {}}
        onClick={() => onClose("addPharmacy")}
        role="button"
        tabIndex={0}
        className="cursor-default w-[100vw] h-[100vh] fixed top-0 left-0 z-[150] rounded-xl bg-white opacity-65"
      ></div>
      <div className="w-[50vw] h-[75vh] fixed z-[150] top-[5vh] left-[25vw] justify-between items-center flex flex-col rounded-xl bg-[#6d6d6d] p-[30px]">
        <div className="bg-gray-100 flex flex-col items-center justify-center h-screen w-full dark:bg-gray-900 relative">
          <button className="absolute top-0 right-0 border-2 border-red-600" onClick={handleClose}>
            <IconContext.Provider value={{ size: "30px", color: "#c31919" }}>
              <IoClose />
            </IconContext.Provider>
          </button>
          <div className="w-full max-w-md px-8 py-10 bg-white rounded-lg shadow-md dark:bg-gray-950 dark:text-gray-200">
            <form onSubmit={handleSubmit}>
              {isLoading ? (
                <svg
                  aria-hidden="true"
                  className="w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600 mx-auto my-[50%] justify-center items-center"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
              ) : (
                <>
                  <h1 className="text-2xl font-semibold text-center mb-6">
                    Add Your New Pharmacy
                  </h1>
                  <p className="text-gray-600 text-center mb-4">
                    Enter Pharmacy Name
                  </p>
                  <div className="flex justify-center ">
                    <input
                      className={`p-2 border-2 border-black rounded-lg ${nameIsInvalid && "border-red-500"}`}
                      onChange={(e) => setInput(e.target.value)}
                      onBlur={handleInputBlur}
                    />
                  </div>
                  {nameIsInvalid && (
                    <div className="flex items-center flex-col justify-between mb-3">
                      <p className="text-red-600 text-sm">
                        Please enter valid name do not use number or character
                      </p>
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full px-4 py-2 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 mt-3"
                  >
                    Submit
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalAdminAddPharmacy;
