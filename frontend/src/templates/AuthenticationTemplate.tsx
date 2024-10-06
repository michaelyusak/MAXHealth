import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import * as image from "../assets/img";
import { FaArrowLeft } from "react-icons/fa6";

const AuthenticationTemplate = (): React.ReactElement => {
  const path = useLocation().pathname;
  const navigate = useNavigate();

  return (
    <>
      <section
        className={`w-screen h-screen relative flex justify-${
          path.includes("reset-password") || path.includes("verification")
            ? "center"
            : "end"
        } items-center`}
      >
        <button
          onClick={() => navigate("/")}
          className="absolute top-[5%] left-[7%] md:left-[5%] xl:left-[2%] p-[7px] border-[1px] border-gray-500 rounded-[100%] bg-gray-200 md:opacity-50 md:hover:opacity-100"
        >
          <FaArrowLeft></FaArrowLeft>
        </button>
        <img
          alt=""
          src={image.backgroundHero}
          className="absolute z-[-5] h-[100vh] w-[100vw] object-cover"
        ></img>
        <Outlet></Outlet>
      </section>
    </>
  );
};

export default AuthenticationTemplate;
