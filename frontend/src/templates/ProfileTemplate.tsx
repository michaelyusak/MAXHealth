import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { path } from "../router/path";
import { GiHamburgerMenu } from "react-icons/gi";

const ProfileTemplate = (): React.ReactElement => {
  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState<boolean>(false);
  return (
    <>
      <div className="w-full flex flex-row justify-between gap-[1rem] lg:gap-[3rem] min-h-[calc(100vh-500px)] p-[10px] md:p-[20px] xl:p-[50px]">
        <div className="w-[30%] p-[3rem] hidden flex-col rounded-[10px] h-fit bg-white shadow-[0_5px_20px_-8px_rgba(0,0,0,0.3)] lg:flex">
          <Link to={path.profile}>
            <div className="text-[16px] xl:text-[20px] pb-[1rem]">Profile</div>
          </Link>
          <Link to={path.address}>
            <div className="text-[16px] xl:text-[20px] pb-[1rem]">Address</div>
          </Link>
        </div>
        <div className="lg:hidden relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="h-fit mb-auto p-[10px]"
          >
            <GiHamburgerMenu className="text-[20px] md:text-[20px] xl:text-[24px]" />
          </button>
          {showMenu && (
            <div className="absolute flex flex-col gap-[5px] items-start bg-white w-[200px] shadow-[0_5px_20px_-8px_rgba(0,0,0,0.3)] px-[20px] py-[5px] rounded-xl">
              <button
                onClick={() => {
                  navigate(path.profile);
                  setShowMenu(false);
                }}
              >
                <div className="text-[16px] xl:text-[20px]">
                  Profile
                </div>
              </button>
              <button
                onClick={() => {
                  navigate(path.address);
                  setShowMenu(false);
                }}
              >
                <div className="text-[16px] xl:text-[20px]">
                  Address
                </div>
              </button>
            </div>
          )}
        </div>

        <Outlet />
      </div>
    </>
  );
};

export default ProfileTemplate;
