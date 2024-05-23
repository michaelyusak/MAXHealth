import React from "react";
import AdminCategoryTable from "../components/AdminCategoryTable";
import AdminDrugsTable from "../components/AdminDrugsTable";

const AdminDashboardPage = (): React.ReactElement => {
  return (
    <div>
      <div className="flex justify-between h-[82vh]">
        <AdminCategoryTable></AdminCategoryTable>
        <AdminDrugsTable></AdminDrugsTable>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
