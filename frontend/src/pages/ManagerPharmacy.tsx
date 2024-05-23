import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import ManagerPharmacyManagement from "../components/ManagerPharmacyManagement";
import PaginationInfo from "../components/PaginationInfo";
import { IconContext } from "react-icons";

const ManagerPharmacy = (): React.ReactElement => {
  const [page, setPage] = useState<number>(1)
  const [totalPage, setTotalPage] = useState<number>(1)
  const [itemPerPage, setItemPerPage] = useState<string>("5")
  const [search, setSearch] = useState({
    searchInput:"",
    searchData:"",
  });

  const handleSetTotalPage= (totalPage:number)=>{
    setTotalPage(totalPage)
  } 

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch({...search, searchInput: event.target.value});
  };

  const handleOnSearch = () => {
    setSearch({...search, searchData: search.searchInput})
  };

  return (
    <div className="flex flex-col mt-[-30px] gap-5 h-[80vh]">
      <div className="flex flex-row justify-between">
        <h2 className="text-[25px] font-bold">Pharmacy</h2>
        <div className="flex items-center gap-2 p-2">
            <div className="flex items-center justify-between bg-gray-100 rounded-[8px] py-[1px] px-[7px]">
              <input
                placeholder="Enter Pharmacy Name"
                className="text-black py-2 w-[100%] px-3 bg-transparent focus:outline-0"
                value={search.searchInput}
                onChange={handleOnChange}
              />
              <button
                type="button"
                className="text-2xl"
                onClick={handleOnSearch}
              >
                <IconContext.Provider value={{ color: "#000D44" }}>
                  <FaSearch />
                </IconContext.Provider>
              </button>
            </div>
          </div>
      </div>
      <ManagerPharmacyManagement OnSearch={search.searchData} limit={itemPerPage} page={page} onTotalPage={handleSetTotalPage}/>
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
  );
};

export default ManagerPharmacy;
