import React from "react";

type toastProps = {
  message: string;
  isSuccess: boolean;
  withLoginButton?: boolean;
};

const Toast = ({
  message,
  isSuccess,
  withLoginButton,
}: toastProps): React.ReactElement => {
  return (
    <div
      className={`w-[80%] md:w-[70%] xl:w-[60%] flex justify-center gap-[10px] text-center fixed z-[1000] border-2 left-[50%] translate-x-[-50%] top-[50px] ${
        isSuccess
          ? "bg-[#EAFCEF] border-[#33A720] text-[#33A720]"
          : "bg-[#FFDDCA] border-[#F60707] text-[#F60707]"
      } px-[15px] py-[5px] rounded-[8px] text-[18px] font-[600]`}
    >
      <p>
        {message}{" "}
        {withLoginButton && (
          <a
            href="/auth/login"
            className={`px-[2px] border-b-[2px] ${
              isSuccess
                ? "bg-[#EAFCEF] border-[#33A720] text-[#33A720]"
                : "bg-[#FFDDCA] border-[#F60707] text-[#F60707]"
            } h-[25px]`}
          >
            Login here
          </a>
        )}
      </p>
    </div>
  );
};

export default Toast;
