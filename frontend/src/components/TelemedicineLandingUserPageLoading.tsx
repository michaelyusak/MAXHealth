import React from "react";

const TelemedicineLandingUserPageLoading = (): React.ReactElement => {
  return (
    <div className="w-[350px] bg-gray-300 animate-pulse h-[400px] rounded-xl flex shadow-[0px_0px_15px_0px_rgba(0,0,0,0.3)] flex-col items-center justify-between px-[20px] py-[10px]">
      <div className="w-[175px] h-[175px] bg-gray-500 object-cover rounded-[100%]"></div>
      <div className="text-center w-[100%] gap-[5px] flex flex-col items-center">
        <div className="w-[60%] h-[24px] bg-gray-500"></div>
        <div className="w-[100%] h-[24px] bg-gray-500"></div>
        <div className="w-[90%] h-[24px] bg-gray-500">
          <div className="w-[100%] h-[24px] bg-gray-500"></div>
        </div>
      </div>
      <button className="h-[50px] w-[50%] bg-gray-500"></button>
    </div>
  );
};

export default TelemedicineLandingUserPageLoading;
