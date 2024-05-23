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
      <div className="lg:w-[40%] w-[80%] h-[25%] lg:h-[22%] absolute z-[50] top-[50%] left-[50%] justify-between items-center flex flex-col translate-x-[-50%] rounded-xl translate-y-[-50%] bg-white p-[30px]">
        <div>
          <p className="text-[20px] word-break text-center">
            Are you sure want to end this consultation session?
          </p>
          <p className="font-[600] text-[20px] text-[#FF0000]">
            Once the chat room closed, it cannot be reopenned.
          </p>
        </div>
        <div className="flex w-[80%] lg:w-[50%] justify-between">
          <button
            onClick={() => onCancel()}
            className="px-[20px] py-[3px] rounded-[8px] text-[18px] font-[600] text-white bg-[#FF0000]"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm()}
            className="px-[20px] py-[3px] rounded-[8px] text-[18px] font-[600] text-white bg-[#1F5FFF]"
          >
            End Consultation
          </button>
        </div>
      </div>
    </>
  );
};

export default EndChatConfirmationModal;
