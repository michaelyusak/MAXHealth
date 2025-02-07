import React, { useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { Link, Outlet } from "react-router-dom";

const DoctorProfileTemplate = (): React.ReactElement => {
  const [showMenu, setShowMenu] = useState<boolean>(false);
  return (
    <>
      <div className="w-full flex flex-row justify-between gap-[1rem] lg:gap-[3rem] min-h-[calc(100vh-500px)]">
        <div className="w-[30%] p-[3rem] hidden flex-col rounded-[10px] h-fit bg-white shadow-[0_5px_20px_-8px_rgba(0,0,0,0.3)] lg:flex">
          <Link to={"/doctors/profile/"}>
            <div className="text-[20px] pb-[1rem]">Profile</div>
          </Link>
          <Link to={"/doctors/telemedicine/"}>
            <div className="text-[20px] pb-[1rem]">Chats</div>
          </Link>
        </div>
        <div className="lg:hidden relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="h-fit mb-auto p-[10px]"
          >
            <GiHamburgerMenu className="text-[28px]" />
          </button>
          {showMenu && (
            <div className="absolute bg-white w-[300px] shadow-[0_5px_20px_-8px_rgba(0,0,0,0.3)] px-[20px] py-[5px] rounded-xl">
              <Link to={"/doctors/profile/"}>
                <div className="text-[20px] pb-[1rem]">Profile</div>
              </Link>
              <Link to={"/doctors/telemedicine/"}>
                <div className="text-[20px] pb-[1rem]">Chats</div>
              </Link>
            </div>
          )}
        </div>

        <Outlet />
      </div>
    </>
  );
};

export default DoctorProfileTemplate;
