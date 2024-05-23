import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import ManagerFooter from "../components/ManagerFooter";

const TelemedicineTemplate = (): React.ReactElement => {
  return (
    <>
      <Header />
      <div className="w-[100vw] h-[85vh] mt-[10px]">
        <Outlet />
      </div>

      <ManagerFooter withoutSideNav={true}></ManagerFooter>
    </>
  );
};

export default TelemedicineTemplate;
