import React from "react";

type modalProps = {
  onClose: () => void;
  picture: string;
};

const Modal = ({ onClose, picture }: modalProps): React.ReactElement => {
  return (
    <>
      <div
        onKeyDown={() => {}}
        onClick={() => onClose()}
        role="button"
        tabIndex={0}
        className="cursor-default w-[100vw] h-[100vh] fixed top-0 left-0 z-[50] rounded-xl bg-white opacity-65"
      ></div>
      <div className="w-[45vw] h-[86vh] fixed z-[50] top-[5vh] left-[30vw] justify-between items-center flex flex-col rounded-xl bg-[#DFF1FD] p-[30px]">
        <img
          src={picture}
          className="w-full h-[90%] object-contain object-center"
        />
        <div className="flex w-full justify-center">
          <button
            onClick={() => onClose()}
            className="px-[20px] py-[3px] rounded-[8px] font-[600] text-white bg-[#1F5FFF]"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};

export default Modal;
