import React, { useContext, useState } from "react";
import { IconContext } from "react-icons";
import { IoShieldCheckmarkOutline } from "react-icons/io5";
import { HandleShowToast } from "../util/ShowToast";
import { ToastContext } from "../contexts/ToastData";
import { HandleAddFormData, HandleAddRaw } from "../util/API";
import { NameRegex } from "../util/Regex";
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";
import { useNavigate } from "react-router-dom";

type modalProps = {
  onClose: () => void;
  onFetch: () => void;
};

type Input = {
  name: string;
  email: string;
  file: File | undefined;
};

const ModalAddUser = ({ onClose, onFetch }: modalProps): React.ReactElement => {
  const navigate = useNavigate();

  const [isSuccess, setIsSuccess] = useState(false);
  const [input, setInput] = useState<Input>({
    name: "",
    email: "",
    file: undefined,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setToast } = useContext(ToastContext);
  const [didEdit, setDidEdit] = useState({
    name: false,
    email: false,
    file: false,
  });

  const nameIsInvalid = didEdit.name && !NameRegex.test(input.name);

  const emailIsInvalid = didEdit.email && !input.email.includes("@");

  const fileIsInvalid = didEdit.file && input.file === null;

  const sendEmail = () => {
    const urlSendEmail = import.meta.env.VITE_HTTP_BASE_URL + "/partners/access-details";
    const body = {
      email: input.email,
    };
    setIsLoading(true);
    HandleAddRaw(urlSendEmail, JSON.stringify(body), true)
      .then(() => {
        HandleShowToast(setToast, true, "Add pharmacy manager success", 5);
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

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const url = import.meta.env.VITE_HTTP_BASE_URL +  "/partners";

    const formData = new FormData();

    const data = {
      name: input.name,
      email: input.email,
    };

    const file = input.file;

    formData.append("data", JSON.stringify(data));

    if (file) {
      formData.append("file", file);
    }

    setIsLoading(true);
    HandleAddFormData(formData, url, true)
      .then(() => {
        HandleShowToast(setToast, true, "Add pharmacy manager success", 5);
        sendEmail();
        handleClose();
        onFetch();
      })
      .catch((error: Error) => {
        if (error.message == MsgRefreshTokenNotFound) {
          navigate("/auth/login");
        }
        HandleShowToast(setToast, false, error.message, 5);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleInputBlur(event: React.ChangeEvent<HTMLInputElement>) {
    const { name } = event.target;
    setDidEdit((prevEdit) => ({
      ...prevEdit,
      [name]: true,
    }));
  }

  const handleClose = () => {
    setInput({
      name: "",
      email: "",
      file: undefined,
    });
    setIsSuccess(false);
    onClose();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = event.target;
    setDidEdit({ ...didEdit, [name]: true });

    if (name === "file" && files) {
      const fileName = files[0].name;
      const fileSize = files[0].size;

      let errorMsg = "";

      const fileFormat = fileName.split(".").pop();

      if (fileFormat && !["png", "jpg", "jpeg"].includes(fileFormat)) {
        errorMsg = `File must be in either png, jpg, or jpeg format`;
        HandleShowToast(setToast, false, errorMsg, 5);
        return;
      }

      if (fileSize > 2000000) {
        errorMsg = `File must not be greater than 2Mb`;
        HandleShowToast(setToast, false, errorMsg, 5);
        return;
      }

      setInput({ ...input, file: files[0] });
    } else {
      setInput({ ...input, [name]: value });
    }
  };

  const isValidForm = !nameIsInvalid && !fileIsInvalid && !emailIsInvalid;

  return (
    <>
      <div
        onKeyDown={() => {}}
        onClick={() => onClose()}
        role="button"
        tabIndex={0}
        className="cursor-default w-[100vw] h-[100vh] fixed top-0 left-0 z-[150] rounded-xl bg-white opacity-65"
      ></div>
      <div className="w-[50vw] h-[75vh] fixed z-[150] top-[5vh] left-[25vw] justify-between items-center flex flex-col rounded-xl bg-[#DFF1FD] p-[30px]">
        {!isSuccess ? (
          <form
            className="flex flex-col gap-1 w-[37vw]"
            onSubmit={(event) => handleSubmit(event)}
          >
            <h2 className="text-[20px] font-bold text-center">
              Create Manager Pharmacy
            </h2>
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
                <div className="flex flex-col gap-1">
                  <label htmlFor="name" className="text-[18px] font-semibold">
                    Name{" "}
                  </label>
                  <input
                    className="p-3 rounded-lg"
                    value={input.name}
                    placeholder="name"
                    type="text"
                    name="name"
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                  />
                </div>
                <div className="text-red-400">
                  {nameIsInvalid && <p>Please Enter Your Valid Name !</p>}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="email" className="text-[18px] font-semibold">
                    Email{" "}
                  </label>
                  <input
                    className="p-3 rounded-lg"
                    value={input.email}
                    placeholder="email"
                    type="text"
                    name="email"
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                  />
                </div>
                <div className="text-red-400">
                  {emailIsInvalid && <p>Invalid Email Format !</p>}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="file" className="text-[18px] font-semibold">
                    File
                  </label>
                  <input
                    className="p-3 rounded-lg"
                    placeholder="Enter your file"
                    type="file"
                    name="file"
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                  />
                </div>
                <div className="text-red-200">
                  {fileIsInvalid && <p>Please Enter Valid File</p>}
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    className={`text-white focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:outline-non ${
                      isValidForm
                        ? "bg-blue-500 hover:bg-blue-800"
                        : "bg-blue-900"
                    }`}
                    type="submit"
                    disabled={!isValidForm}
                  >
                    Submit
                  </button>
                  <button
                    className="text-white focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:outline-non bg-red-500 hover:bg-red-800"
                    type="button"
                    onClick={handleClose}
                  >
                    cancel
                  </button>
                </div>
              </>
            )}
          </form>
        ) : (
          <div className="flex flex-col items-center gap-5">
            <IconContext.Provider
              value={{ size: "150px", color: "#000d43", className: "m-[auto]" }}
            >
              <IoShieldCheckmarkOutline />
            </IconContext.Provider>
            <h2 className="text-[30px]">Create Account Success</h2>
            <div className="">
              <button
                className="text-white focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:outline-non bg-red-500 hover:bg-red-800"
                onClick={handleClose}
              >
                close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ModalAddUser;
