import React from "react";
import * as image from "../assets/img/index";
import { NavLink } from "react-router-dom";

const NotFoundHeader = (): React.ReactElement => {
  return (
    <div className="w-[100%] h-[100px] bg-[#dff1fd] flex items-center">
      <div className="w-[1440px] m-[auto] justify-between py-3 flex items-center">
        <NavLink to="/">
          <img src={image.logoV2} className="w-[150px]" />
        </NavLink>
      </div>
    </div>
  );
};

export default NotFoundHeader;
