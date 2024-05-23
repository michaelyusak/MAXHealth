import React from "react";
import { ButtonStyle } from "../interfaces/Button";

const STYLES = [
  "bg-gradient-to-b md:py-3 md:px-4 from-green-400 to-white-100 md:rounded-3xl font-bold cursor-pointer shadow-[0_5px_8px_-8px_rgba(0,0,0,0.3)]",
  "bg-gradient-to-b py-3 px-4 from-[#1F5FFF] from-[60%] to-white-200 rounded-3xl text-white font-bold shadow-[0_5px_8px_-8px_rgba(0,0,0,0.3)]",
  "h-fit flex justify-center py-3 px-4 items-center text-xl cursor-pointer",
  "rounded-[100%] border-[none] bg-white md:w-[50px] md:h-[50px] flex justify-center items-center text-xl cursor-pointer text-[#000D44]",
  "bg-gradient-to-b py-3 px-4 from-[#C2D4FF] from-[60%] to-white-200 rounded-3xl font-bold shadow-[0_5px_8px_-8px_rgba(0,0,0,0.3)]",
  "bg-gradient-to-b py-3 px-4 from-[#F60707] from-[60%] to-white-200  rounded-3xl text-white font-bold h-fit shadow-[0_5px_8px_-8px_rgba(0,0,0,0.3)]",
  "text-[20px] border-4 rounded-[100%] w-[55px] h-[55px] flex justify-center items-center mr-4 border-[#14C57B]",
  "bg-gradient-to-b from-lightGreen from-[60%] to-white-200 rounded-3xl font-bold shadow-[0_5px_8px_-8px_rgba(0,0,0,0.3)] ",
  "bg-red-400 rounded-lg font-bold text-white text-[16px] py-2 px-3",
];

type ButtonProps = {
  children: React.ReactNode;
  type: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  buttonStyle: ButtonStyle;
  disabled?: boolean;
  additionalClassName?: string;
};

export const Button = ({
  children,
  type,
  onClick,
  disabled,
  buttonStyle,
  additionalClassName,
}: ButtonProps): React.ReactElement => {
  const checkButtonStyle =
    buttonStyle === "green" && disabled
      ? STYLES[7]
      : buttonStyle === "green"
      ? STYLES[0]
      : buttonStyle === "blue" && disabled
      ? STYLES[4]
      : buttonStyle === "blue"
      ? STYLES[1]
      : buttonStyle === "icon-header"
      ? STYLES[2]
      : buttonStyle === "icon-footer"
      ? STYLES[3]
      : buttonStyle === "red"
      ? STYLES[5]
      : buttonStyle === "carousel"
      ? STYLES[6]
      : buttonStyle === "add-user"
      ? STYLES[7]
      : STYLES[0];

  return (
    <button
      className={`uppercase md:py-3 md:px-4 ${
        !disabled ? "hover:translate-y-px hover:translate-x-px" : ""
      } ${checkButtonStyle} ${additionalClassName}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
