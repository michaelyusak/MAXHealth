import React from "react";
import { MdArrowForwardIos } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";

const ManagerHeader = (): React.ReactElement => {
  const navigate = useNavigate();
  const location = useLocation();
  const sectionName = location.pathname.split("/").pop();

  const pageTitle =
    sectionName == "dashboard"
      ? "Dashboard"
      : sectionName == "drugs"
      ? "Manage Drugs"
      : sectionName == "orders"
      ? "Manage Orders"
      : sectionName == "reports"
      ? "Pharmacy Reports"
      : "";

  return (
    <div className="fixed left-0 top-0 z-20 pl-[250px] bg-[#DFF1FD] w-[100%] py-[10px]">
      <div className="flex flex-col gap-[10px]">
        {sectionName == "dashboard" ? (
          <button className="text-[16px] font-[500] w-fit">Dashboard</button>
        ) : (
          <div className="flex items-center gap-[5px]">
            <button
              onClick={() => navigate("/manager/dashboard")}
              className="text-[16px] font-[500]"
            >
              Dashboard
            </button>
            <MdArrowForwardIos className="h-[12px]"></MdArrowForwardIos>
            <button className="text-[16px] font-[500]">
              {sectionName
                ? `${sectionName[0].toUpperCase()}${sectionName.slice(1)}`
                : ""}
            </button>
          </div>
        )}
        <h1 className="text-[24px] font-[600]">{pageTitle}</h1>
      </div>
    </div>
  );
};

export default ManagerHeader;
