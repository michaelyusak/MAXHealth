import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import ManagerSideNav from "../components/ManagerSideNav";
import ManagerHeader from "../components/ManagerHeader";
import ManagerFooter from "../components/ManagerFooter";
import { INavItem } from "../interfaces/NavItem";

export const AdminTemplate = (): React.ReactElement => {
  const AdminNavItem: INavItem[] = [
    {
      itemName: "Categories & Drugs",
      path: "/admin/dashboard",
      isDefault: true,
    },
    {
      itemName: "Manage User",
      path: "/admin/manage-user",
      isDefault: true,
    },
    {
      itemName: "Order payment proof",
      path: "/admin/payment",
      isDefault: true,
    },
    {
      itemName: "Orders",
      path: "/admin/orders",
      isDefault: true,
    },
    {
      itemName: "Reports",
      path: "/admin/reports",
      isDefault: true,
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
      <ManagerSideNav navItems={AdminNavItem} role="admin"></ManagerSideNav>
      <ManagerHeader></ManagerHeader>

      <div className="pl-[250px] h-[90%] mb-[20px]  mt-[90px] pt-[30px] w-[100%] pr-[30px]">
        <Outlet></Outlet>
      </div>

      <ManagerFooter></ManagerFooter>
    </section>
  );
};
