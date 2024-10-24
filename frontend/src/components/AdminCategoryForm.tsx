import React, { ChangeEvent, useContext, useState } from "react";
import { IconContext } from "react-icons";
import { CgArrowsExchange } from "react-icons/cg";
import { HandleShowToast } from "../util/ShowToast";
import { ToastContext } from "../contexts/ToastData";
import { SpecialNameRegex } from "../util/Regex";
import {
  HandleAddFormData,
  HandleDelete,
  HandlePutFormData,
} from "../util/API";
import { IoMdAdd } from "react-icons/io";
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";
import { useNavigate } from "react-router-dom";

type adminCategoryFormProps = {
  purpose: "update" | "add";
  inputValues: {
    [key: string]: {
      value: string | number;
      error: string;
      file?: File;
    };
  };
  setInputValues: React.Dispatch<
    React.SetStateAction<
      | {
          [key: string]: {
            value: string | number;
            error: string;
            file?: File | undefined;
          };
        }
      | undefined
    >
  >;
  handleClose: () => void;
  onAction: () => void;
};

const AdminCategoryForm = ({
  purpose,
  inputValues,
  setInputValues,
  handleClose,
  onAction,
}: adminCategoryFormProps) => {
  const navigate = useNavigate();

  const { setToast } = useContext(ToastContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) {
      return;
    }

    const file = e.target.files[0];

    const fileName = file.name;
    const fileSize = file.size;

    let errorMsg = "";

    const fileFormat = fileName.split(".").pop();

    if (fileFormat && fileFormat != "png") {
      errorMsg = `File must be in png format`;
      HandleShowToast(setToast, false, errorMsg, 5);
      return;
    }

    if (fileSize > 500000) {
      errorMsg = `File must not be greater than 500kB`;
      HandleShowToast(setToast, false, errorMsg, 5);
      return;
    }

    setInputValues((prevVal) => ({
      ...prevVal,
      ["image"]: { value: URL.createObjectURL(file), error: "", file: file },
    }));
  }

  function handleNameChange(e: ChangeEvent<HTMLInputElement>) {
    let errorMsg = "";

    if (!SpecialNameRegex.test(e.target.value)) {
      errorMsg = "Category Name is invalid";
    }

    if (e.target.value == "") {
      errorMsg = "Category Name is required";
    }

    setInputValues((prevVal) => ({
      ...prevVal,
      ["name"]: { value: e.target.value, error: errorMsg },
    }));
  }

  function handleUpdateCategory() {
    const url = import.meta.env.VITE_HTTP_BASE_URL +  `/categories/${inputValues["id"].value}`;

    const formData = new FormData();

    const data = {
      category_name: inputValues["name"].value,
    };

    const file = inputValues["image"].file;

    formData.append("data", JSON.stringify(data));

    if (file) {
      formData.append("file", file);
    }

    setIsLoading(true);
    HandlePutFormData(formData, url, true)
      .then(() => {
        HandleShowToast(setToast, true, "Category update success", 5);
        handleClose();
        onAction();
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

  function handleDeleteCategory() {
    const url = import.meta.env.VITE_HTTP_BASE_URL +  `/categories/${inputValues["id"].value}`;

    setIsLoading(true);
    HandleDelete(url, true)
      .then(() => {
        HandleShowToast(setToast, true, "Delete success", 5);
        onAction();
        handleClose();
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

  function handleAddCategory() {
    const url = import.meta.env.VITE_HTTP_BASE_URL +  "/categories/";

    const formData = new FormData();

    const data = {
      category_name: inputValues["name"].value,
    };

    const file = inputValues["image"].file;

    formData.append("data", JSON.stringify(data));

    if (file) {
      formData.append("file", file);
    }

    setIsLoading(true);
    HandleAddFormData(formData, url, true)
      .then(() => {
        HandleShowToast(setToast, true, "Add category success", 5);
        onAction();
        handleClose();
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

  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);

  const [showCancelConfirmation, setShowCancelConfirmation] =
    useState<boolean>(false);

  return (
    <div className="absolute z-40 top-0 left-0 h-[100vh] w-[100vw]">
      <div className="w-[100%] h-full bg-black bg-opacity-[0.6]"></div>

      {isLoading && (
        <div className="w-[60%] h-[60%] absolute z-[60] top-[50%] left-[50%] translate-x-[-50%] rounded-xl translate-y-[-50%] bg-gray-400 opacity-[0.75] animate-pulse"></div>
      )}

      {showDeleteConfirmation && (
        <>
          <div className="w-[60%] h-[60%] absolute z-[50] top-[50%] left-[50%] translate-x-[-50%] rounded-xl translate-y-[-50%] bg-white opacity-[0.75]"></div>
          <div className="w-[20%] h-[18%] absolute z-[50] top-[50%] left-[50%] justify-between items-center flex flex-col translate-x-[-50%] rounded-xl translate-y-[-50%] bg-[#DFF1FD] p-[30px]">
            <p className="text-[18px] text-center font-[600]">
              Are you sure want to delete this category?
            </p>
            <div className="flex w-full justify-between">
              <button
                className="px-[20px] py-[3px] rounded-[8px] font-[600] text-white bg-[#FF0000]"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                No
              </button>
              <button
                className="px-[20px] py-[3px] rounded-[8px] font-[600] text-white bg-[#1F5FFF]"
                onClick={() => handleDeleteCategory()}
              >
                Yes
              </button>
            </div>
          </div>
        </>
      )}

      {showCancelConfirmation && (
        <>
          <div className="w-[60%] h-[60%] absolute z-[50] top-[50%] left-[50%] translate-x-[-50%] rounded-xl translate-y-[-50%] bg-white opacity-[0.75]"></div>
          <div className="w-[20%] h-[18%] absolute z-[50] top-[50%] left-[50%] justify-between items-center flex flex-col translate-x-[-50%] rounded-xl translate-y-[-50%] bg-[#DFF1FD] p-[30px]">
            <p className="text-[18px] text-center font-[600]">
              Are you sure want to cancel? All changes will be discarded.
            </p>
            <div className="flex w-full justify-between">
              <button
                className="px-[20px] py-[3px] rounded-[8px] font-[600] text-white bg-[#FF0000]"
                onClick={() => setShowCancelConfirmation(false)}
              >
                No
              </button>
              <button
                className="px-[20px] py-[3px] rounded-[8px] font-[600] text-white bg-[#1F5FFF]"
                onClick={() => handleClose()}
              >
                Yes
              </button>
            </div>
          </div>
        </>
      )}

      <div className="w-[60%] absolute z-40 h-[60%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-xl opacity-100 top-[50%] left-[50%] bg-opacity-100">
        <div className="w-full relative p-[20px] rounded-xl h-full justify-center flex flex-col gap-[20px]">
          <h1 className="text-[28px] font-[600]">
            {purpose == "update" ? "Edit" : purpose == "add" ? "New" : ""}{" "}
            Category
          </h1>

          <div className="flex justify-between items-center">
            <div className="relative h-fit shadow-[0px_0px_15px_0px_rgba(0,0,0,0.3)] w-fit p-[5px] rounded-xl">
              <img
                alt=""
                src={inputValues["image"]?.value.toString()}
                className="w-[400px] h-[400px] object-cover rounded-xl"
              ></img>
              <input
                type="file"
                id="drug-picture-input"
                className="hidden"
                onChange={(e) => handleFileChange(e)}
              ></input>
              <label
                htmlFor="drug-picture-input"
                className="bg-[#DFF1FD] cursor-pointer flex items-center justify-center absolute rounded-[100%] top-[370px] left-[370px]"
                onClick={(e) => e.stopPropagation()}
              >
                <IconContext.Provider value={{ size: "30px", color: "black" }}>
                  {purpose == "update" && <CgArrowsExchange></CgArrowsExchange>}
                  {purpose == "add" && <IoMdAdd></IoMdAdd>}
                </IconContext.Provider>
              </label>
            </div>

            <div className="flex flex-col gap-[5px] w-[50%]">
              <div className="flex justify-between items-center">
                <h1 className="text-[20px] font-[600]">Name</h1>
                <p className="font-[600] text-[#E01A52]">
                  {inputValues["name"].error}
                </p>
              </div>
              <input
                className="h-fit text-[20px] px-[10px] py-[5px] rounded-xl border-2 border-slate-600"
                type="text"
                onChange={(e) => handleNameChange(e)}
                value={inputValues["name"].value.toString()}
              ></input>
            </div>
          </div>
          <div className="flex justify-end gap-[10px]">
            {purpose == "update" && (
              <button
                onClick={() => handleUpdateCategory()}
                className="px-[15px] py-[5px] rounded-[8px] text-[16px] font-[600] bg-[#1F5FFF] text-white"
              >
                SAVE
              </button>
            )}

            {purpose == "add" && (
              <button
                onClick={() => handleAddCategory()}
                className="px-[15px] py-[5px] rounded-[8px] text-[16px] font-[600] bg-[#1F5FFF] text-white"
              >
                ADD
              </button>
            )}

            <button
              onClick={() => setShowCancelConfirmation(true)}
              className="px-[15px] py-[5px] rounded-[8px] text-[16px] font-[600] bg-slate-600 text-white"
            >
              CANCEL
            </button>
            {purpose == "update" && (
              <button
                onClick={() => setShowDeleteConfirmation(true)}
                className="px-[15px] py-[5px] rounded-[8px] text-[16px] font-[600] bg-[#E01A52] text-white"
              >
                DELETE
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCategoryForm;
