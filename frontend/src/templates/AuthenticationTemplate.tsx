import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import * as image from "../assets/img";

const AuthenticationTemplate = (): React.ReactElement => {
  const path = useLocation().pathname;

  return (
    <>
      <section
        className={`w-screen h-screen flex justify-${
          path.includes("reset-password") || path.includes("verification")
            ? "center"
            : "end"
        } items-center`}
      >
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
