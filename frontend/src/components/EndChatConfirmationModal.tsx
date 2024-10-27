import React from "react";

type endChatConfirmationModalProps = {
  onCancel: () => void;
  onConfirm: () => void;
  onClose: () => void;
};

const EndChatConfirmationModal = ({
  onCancel,
  onConfirm,
  onClose,
}: endChatConfirmationModalProps): React.ReactElement => {
  return (
    <>
      <div onClick={() => onClose()} className="w-[100vw] h-[100vh] absolute z-[50] top-0 left-0 bg-black opacity-[0.75]"></div>
      <div className="w-[80%] md:w-[60%] xl:w-[50%] p-[1rem] md:p-[2rem] xl:p-[3rem] gap-[0.5rem] absolute z-[50] top-[50%] left-[50%] justify-between items-center flex flex-col translate-x-[-50%] rounded-xl translate-y-[-50%] bg-white">
        <div className="w-full text-center">
          <p className="font-[600] text-[16px] md:text-[18px] xl:text-[20px] word-break">
            Are you sure want to end this consultation session?
          </p>
          <p className="font-[600] text-[16px] md:text-[18px] xl:text-[20px] text-[#FF0000]">
            Once the chat room closed, it cannot be reopenned.
          </p>
        </div>
        <div className="flex w-full justify-center gap-[1rem]">
          <button
            onClick={() => onCancel()}
            className="px-[20px] py-[3px] rounded-[8px] text-[14px] md:text-[16px] lg:text-[18px] font-[600] text-white bg-[#1F5FFF]"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm()}
            className="px-[20px] py-[3px] rounded-[8px] text-[14px] md:text-[16px] lg:text-[18px] font-[600] text-white bg-[#FF0000]"
          >
            End Consultation
          </button>
        </div>
      </div>
    </>
  );
};

export default EndChatConfirmationModal;
