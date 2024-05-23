import React from "react";
import DocotrHeader from "../components/DoctorHeader";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";

const DoctorTemplate = (): React.ReactElement => {
  return (
    <>
      <DocotrHeader />
      <div className="w-[80vw] m-auto my-[30px]">
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default DoctorTemplate;
