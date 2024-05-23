import React, { useState } from "react";
import AdminManageUserTable from "../components/AdminManageUserTable";
import PaginationInfo from "../components/PaginationInfo";

const AdminManageUserPage = (): React.ReactElement => {
  const [page, setPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [itemPerPage, setItemPerPage] = useState<string>("20");

  const handleSetTotalPage = (totalPage: number) => {
    setTotalPage(totalPage);
  };
  return (
    <div className="w-[100%] flex flex-col gap-5 mt-[-43px]">
      <h2 className="text-2xl font-bold uppercase">User Management</h2>
      <AdminManageUserTable
        limit={itemPerPage}
        page={page}
        onTotalPage={handleSetTotalPage}
      />
      <div className="flex justify-end">
        <PaginationInfo
          stepItemPerPage={10}
          setItemPerPage={(value) => setItemPerPage(value)}
          itemPerPage={parseInt(itemPerPage)}
          minItemPerPage={5}
          maxItemPerPage={100}
          totalPage={totalPage}
          activePage={page}
          setPage={(value) => setPage(value)}
          withItemPerPage={true}
        ></PaginationInfo>
      </div>
    </div>
  );
};

export default AdminManageUserPage;
