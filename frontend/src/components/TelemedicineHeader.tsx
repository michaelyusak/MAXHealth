import React from "react";
import { NavLink } from "react-router-dom";
import * as image from "../assets/img/index";
import Button from "./Button";
import { IconContext } from "react-icons";
import { IoSearch } from "react-icons/io5";
import { AiOutlineShop } from "react-icons/ai";
import { FaRegUser } from "react-icons/fa";
import { BsCart4 } from "react-icons/bs";

const TelemedicineHeader = (): React.ReactElement => {
  return (
    <div className="w-[100%] h-[100px]  bg-[#dff1fd] flex items-center">
      <div className="w-[1440px] m-[auto] justify-between py-3 flex flex-row items-center">
        <div className="cursor-pointer">
          <NavLink to="/">
            <img src={image.logoSvg} className="w-[150px]" />
          </NavLink>
        </div>
        <div className=" flex gap-[15px] items-center text-[#000d43]">
          <Button type="button" buttonStyle="icon-header">
            <IconContext.Provider value={{ size: "25px", color: "#000d44" }}>
              <IoSearch />
            </IconContext.Provider>
          </Button>
          <NavLink to="/product">
            <Button type="button" buttonStyle="icon-header">
              <IconContext.Provider value={{ size: "25px", color: "#000d44" }}>
                <AiOutlineShop />
              </IconContext.Provider>
            </Button>
          </NavLink>
          <NavLink to="/users/profile" className={"items-center flex"}>
            <Button type="button" buttonStyle="icon-header">
              <IconContext.Provider value={{ size: "23px", color: "#000d44" }}>
                <FaRegUser />
              </IconContext.Provider>
            </Button>
          </NavLink>
          <NavLink to="/cart">
            <Button type="button" buttonStyle="icon-header">
              <IconContext.Provider value={{ size: "25px", color: "#000d44" }}>
                <BsCart4 />
              </IconContext.Provider>
            </Button>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default TelemedicineHeader;
