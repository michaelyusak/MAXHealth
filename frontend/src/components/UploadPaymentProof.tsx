import React, { ChangeEvent, useContext, useState } from "react";
import { ToastContext } from "../contexts/ToastData";
import { HandleShowToast } from "../util/ShowToast";
import Button from "./Button";
import closeIcon from "../assets/img/close-icon.png";
import Dialog from "./Dialog";

interface UploadPaymentProofProps {
  onUpload: (file: File) => void;
}
const UploadPaymentProof = ({
  onUpload,
}: UploadPaymentProofProps): React.ReactElement => {
  const { setToast } = useContext(ToastContext);

  const [showLargeImage, setShowLargeImage] = useState<boolean>(false);
  const [inputValues, setInputValues] = useState<{
    [key: string]: {
      error: string;
      file?: File;
    };
  }>({
    image: {
      error: "",
    },
  });

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) {
      return;
    }

    const file = e.target.files[0];

    const fileName = file.name;
    const fileSize = file.size;

    let errorMsg = "";

    const fileFormat = fileName.split(".").pop();

    if (!(fileFormat && ["png", "jpg", "jpeg"].includes(fileFormat))) {
      errorMsg = "File must be in jpeg, jpg, or png format";
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

  return (
    <>
      <div className="w-[100%] relative md:w-[450px] h-fit flex flex-col gap-[2rem]">
        {inputValues["image"]?.file ? (
          <div className="flex flex-row justify-between items-center gap-[1rem]">
            <div className="flex flex-row items-center gap-[1rem]">
              <img
                alt={inputValues["image"]?.file.name}
                src={URL.createObjectURL(inputValues["image"]?.file)}
                className="w-[150px] h-[150px] object-cover object-center rounded-xl"
              />
              <div className="flex flex-col justify-between">
                <p>{inputValues["image"]?.file.name}</p>
                <p
                  className="text-brightBlue cursor-pointer"
                  onClick={() => setShowLargeImage(true)}
                >
                  See preview
                </p>
              </div>
            </div>
            <img
              alt=""
              src={closeIcon}
              className="w-[20px] h-[20px] cursor-pointer"
              onClick={() =>
                setInputValues((prevVal) => ({
                  ...prevVal,
                  ["image"]: {
                    error: "",
                    file: undefined,
                  },
                }))
              }
            />
          </div>
        ) : (
          <>
            <input
              type="file"
              accept="image/png, image/jpg, image/jpeg"
              id="drug-picture-input"
              className="hidden"
              onChange={(e) => handleFileChange(e)}
            ></input>
            <label
              htmlFor="drug-picture-input"
              className="border-dashed border-2 border-white rounded-[20px] w-full h-[150px] p-[1rem] flex flex-col items-center justify-center gap-[0.5rem] cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              <p>Browse your payment proof here</p>
              <p>jpeg, jpg, png are allowed</p>
            </label>
          </>
        )}
        <Button
          type="button"
          buttonStyle="green"
          onClick={() => {
            if (inputValues["image"].file) onUpload(inputValues["image"].file);
          }}
          disabled={!inputValues["image"]?.file}
          additionalClassName="py-2 px-3 rounded-lg "
        >
          Upload
        </Button>
      </div>
      {showLargeImage && inputValues["image"]?.file && (
        <Dialog
          cardWidth="w-[800px]"
          content={
            <img
              alt={inputValues["image"]?.file.name}
              src={URL.createObjectURL(inputValues["image"]?.file)}
              className="w-full h-full object-contain rounded-xl"
            />
          }
          onClose={() => {
            setShowLargeImage(false);
          }}
        />
      )}
    </>
  );
};

export default UploadPaymentProof;
