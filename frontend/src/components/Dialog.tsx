import React from "react";

interface DialogProps {
  onClose?: () => void;
  content: React.ReactElement;
  cardWidth?: string;
}

const Dialog = ({
  onClose,
  content,
  cardWidth,
}: DialogProps): React.ReactElement => {
  return (
    <div
      className={`fixed z-10 left-0 top-0 w-full h-full overflow-auto bg-[rgba(0,0,0,0.4)] ${
        onClose !== undefined ? "cursor-pointer" : ""
      } flex flex-col justify-center items-center p-[2rem]`}
      onClick={onClose}
    >
      <div
        className={`${
          cardWidth ? cardWidth : "w-[500px]"
        } h-fit p-[3rem] bg-white flex flex-col gap-4 cursor-default rounded-[10px] overflow-y-auto max-h-full`}
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </div>
    </div>
  );
};

export default Dialog;
