import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import * as image from "../assets/img/index";
import { NavLink, useNavigate } from "react-router-dom";
import { INavItem } from "../interfaces/NavItem";
import { ToastContext } from "../contexts/ToastData";
import { HandleShowToast } from "../util/ShowToast";

type managerSideNavProps = {
  navItems: INavItem[];
  role: "pharmacy manager" | "admin";
};

const ManagerSideNav = ({
  navItems,
  role,
}: managerSideNavProps): React.ReactElement => {
  useEffect(() => {
    const data = Cookies.get("data");
    const token = Cookies.get("accessToken");

    if (token && data) {
      const dataParsed = JSON.parse(data);

      const roleName = dataParsed["role"];
      if (roleName == role) {
        setIsValid(true);
      }
    }
  }, [role]);

  const [isValid, setIsValid] = useState<boolean>(false);

  const navigate = useNavigate();

  const { setToast } = useContext(ToastContext);

  return (
    <div className="fixed top-0 z-30">
      <aside className="w-[220px] bg-white h-screen z-50 px-[10px] py-[10px] shadow-[0_35px_30px_1px_rgba(0,0,0,0.3)]">
        <img alt="" src={image.logoV2} className="h-[70px] mx-auto"></img>
        <div className="flex flex-col gap-[10px] mt-[50px]">
          {navItems.map((navItem) => (
            <NavLink
              key={navItem.itemName}
              end={navItem.isDefault}
              to={navItem.path}
              className={(isActive) =>
                `${
                  isActive.isActive ? "bg-[#DFF1FD]" : "bg-transparent"
                } text-[16px] font-[600] rounded-[8px] px-[10px] py-[15px]`
              }
            >
              {navItem.itemName}
            </NavLink>
          ))}
          <div
            className={`bg-transparent text-[16px] font-[600] rounded-[8px] px-[10px] py-[15px] cursor-pointer`}
            onClick={() => {
              if (isValid) {
                Cookies.remove("data");
                Cookies.remove("accessToken");
                Cookies.remove("refreshToken");
                navigate("/");
                HandleShowToast(setToast, true, "Successfully Logout", 5);
                setIsValid(false);
                return;
              }
              navigate("/auth/login");
            }}
          >
            Logout
          </div>
        </div>
      </aside>
    </div>
  );
};

export default ManagerSideNav;
