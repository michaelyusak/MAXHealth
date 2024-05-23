import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { NavLink, useNavigate } from "react-router-dom";
import * as image from "../assets/img/index";
import Button from "./Button";
import { IconContext } from "react-icons";
import { FaRegUser } from "react-icons/fa";
import { useAppDispatch } from "../redux/reduxHooks";
import { fetchCartData } from "../slices/CartActions";
import { HandleShowToast } from "../util/ShowToast";
import { ToastContext } from "../contexts/ToastData";

const DoctorHeader = (): React.ReactElement => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { setToast } = useContext(ToastContext);

  useEffect(() => {
    const data = Cookies.get("data");
    const token = Cookies.get("accessToken");

    if (token && data) {
      const dataParsed = JSON.parse(data);

      const roleName = dataParsed["role"];

      if (roleName == "doctor") {
        setIsValid(true);
      }
    }
  }, []);

  const [isValid, setIsValid] = useState<boolean>(false);

  return (
    <div className="w-[100%] h-[100px]  bg-[#dff1fd] flex items-center">
      <div className="w-[1440px] m-[auto] justify-between py-3 flex flex-row items-center">
        <NavLink to="/doctors/">
          <img src={image.logoV2} className="w-[150px]" />
        </NavLink>
        <div className=" flex gap-[15px] items-center text-[#000d43]">
          <NavLink to="/doctors/profile" className={"items-center flex"}>
            <Button type="button" buttonStyle="icon-header">
              <IconContext.Provider value={{ size: "23px", color: "#000d44" }}>
                <FaRegUser />
              </IconContext.Provider>
            </Button>
          </NavLink>
          <Button
            additionalClassName="ml-[10px]"
            onClick={() => {
              if (isValid) {
                Cookies.remove("data");
                Cookies.remove("accessToken");
                Cookies.remove("refreshToken");

                navigate("/");
                dispatch(fetchCartData());
                HandleShowToast(setToast, true, "Successfully Logout", 5);
                setIsValid(false);
                return;
              }
              navigate("/auth/login");
            }}
            type="button"
            buttonStyle={isValid ? "red" : "blue"}
          >
            {isValid ? "Logout" : "Login"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DoctorHeader;
