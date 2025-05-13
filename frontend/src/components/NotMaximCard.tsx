import React from "react";

type notMaximCardProps = {
  onClose: () => void;
};

const NotMaximCard = ({ onClose }: notMaximCardProps): React.ReactElement => {
  return (
    <>
      <div
        onKeyDown={() => {}}
        role="button"
        className="cursor-default w-full h-full fixed top-0 left-0 z-[500] bg-white opacity-65"
      ></div>
      <div className="w-[80%] xl:w-[30%] flex flex-col gap-[50px] h-fit p-[20px] fixed bg-white rounded-[8px] shadow-2xl top-[50%] left-[50%] z-[600] translate-x-[-50%] translate-y-[-50%]">
        <div className="flex flex-col justify-center items-center gap-[10px]">
          <h1 className="text-[20px] font-bold">Important</h1>

          <p className="text-[18px] text-justify">
            Please note that this is not a commercial platform. This is a
            personal project created to demonstrate my software development
            skills. There is no intention to imitate any other site or mislead
            consumers. If you are looking for <b>Maxim Healthcare</b>, please
            visit their official website through this{" "}
            <a
              href="https://www.maximhealthcare.com/"
              className="underline text-blue-700"
            >
              link
            </a>
            . You can also check out my work on my{" "}
            <a
              href="https://github.com/michaelyusak/MAXHealth"
              className="underline text-blue-700"
            >
              GitHub repository
            </a>
            .
          </p>
        </div>
        <div className="flex w-full justify-center">
          <button
            onClick={() => onClose()}
            className="px-[20px] py-[3px] rounded-[8px] font-[600] text-white bg-[#21C55D]"
          >
            Okay
          </button>
        </div>
      </div>
    </>
  );
};

export default NotMaximCard;
