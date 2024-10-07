import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import * as image from "../assets/img";
import { FaArrowLeft } from "react-icons/fa6";
import { IconContext } from "react-icons";

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
          onClick={() => {
            navigate("/")
          }}
          disabled={false}
          className="absolute top-[5%] left-[7%] md:left-[5%] xl:left-[2%] bg-white px-[15px] py-[5px] rounded-[8px] shadow-lg"
        >
          <IconContext.Provider value={{ size: "20px", color: "#374151" }}>
            <FaArrowLeft></FaArrowLeft>
          </IconContext.Provider>
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
