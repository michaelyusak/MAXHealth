import React from "react";
import ManagerSideNav from "../components/ManagerSideNav";
import ManagerHeader from "../components/ManagerHeader";
import { Outlet, useLocation } from "react-router-dom";
import ManagerFooter from "../components/ManagerFooter";
import { INavItem } from "../interfaces/NavItem";

const ManagerTemplate = (): React.ReactElement => {
  const managerNavItems: INavItem[] = [
    {
      itemName: "Dashboard",
      path: "/manager/dashboard",
      isDefault: true,
    },
    {
      itemName: "Drugs",
      path: "/manager/drugs",
      isDefault: false,
    },
    {
      itemName: "Orders",
      path: "/manager/orders",
      isDefault: false,
    },
    {
      itemName: "Pharmacy",
      path: "/manager/pharmacy",
      isDefault: false,
    },
    {
      itemName: "Reports",
      path: "/manager/reports",
      isDefault: false,
    },
    {
      itemName: "Stock Mutation",
      path: "/manager/stock-changes",
      isDefault: false,
    },
  ];

  const location = useLocation();

  const section = location.pathname.split("/").pop();

  return (
    <section
      className={`w-[100%]  h-${
        section == "orders" ? "fit" : "[100%]"
      } flex flex-col justify-between relative bg-[#F5F8FD]`}
    >
      <ManagerSideNav
        navItems={managerNavItems}
        role="pharmacy manager"
      ></ManagerSideNav>
      <ManagerHeader></ManagerHeader>

      <div className="pl-[250px] h-[90%] mb-[20px]  mt-[90px] pt-[30px] w-[100%] pr-[30px]">
        <Outlet></Outlet>
      </div>

      <ManagerFooter></ManagerFooter>
    </section>
  );
};

export default ManagerTemplate;
