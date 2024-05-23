import React, { useState } from "react";
import { CurrencyFormatter } from "../util/CurrencyFormatter";
import { IoMdDownload } from "react-icons/io";
import { IPharmacyDrugByPharmacy } from "../interfaces/Drug";
import ModalEditDrugManager from "./ModalEditDrugManager";
import ModalDeleteDrugManager from "./ModalDelete";
import { FaArrowLeft, FaArrowRight, FaSearch } from "react-icons/fa";
import { pageInfo } from "../interfaces/pharmacyManagers";
import ManagerRequestStock from "./ManagerRequestStock";

type managerDrugsTableProps = {
  drugs: IPharmacyDrugByPharmacy[] | undefined;
  onfetchDataDrugs: () => void;
  setPagePharmacy: (currentPage: number) => void;
  pageInfo: pageInfo | undefined;
  onSearchDrug: (searchDrug: string) => void;
};

const ManagerDrugsTable = ({
  drugs,
  onfetchDataDrugs,
  setPagePharmacy,
  pageInfo,
  onSearchDrug,
}: managerDrugsTableProps): React.ReactElement => {
  let searchTimeout: ReturnType<typeof setTimeout> | null = null;
  const [parmacyDrugData, setParmacyDrugData] =
    useState<IPharmacyDrugByPharmacy>();
  const [openModal, setOpenModal] = useState({
    edit: false,
    delete: false,
    request: false,
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(() => {
      onSearchDrug(value);
    }, 1000);
  };

  const handleOpenModal = (type: string) => {
    switch (type) {
      case "edit":
        setOpenModal({
          ...openModal,
          edit: !openModal.edit,
        });
        break;
      case "delete":
        setOpenModal({
          ...openModal,
          delete: !openModal.delete,
        });
        break;
      case "request":
        setOpenModal({
          ...openModal,
          request: !openModal.request,
        });
        break;
    }
  };

  const handlePageChange = (direction: "left" | "right") => {
    if (direction === "left" && pageInfo) {
      if (pageInfo.page > 1) {
        setPagePharmacy(pageInfo.page - 1);
      }
    } else {
      if (pageInfo && pageInfo.page < pageInfo.page_count) {
        setPagePharmacy(pageInfo.page + 1);
      }
    }
  };

  const handleSetPharmacyDrugId = (data: IPharmacyDrugByPharmacy) => {
    setParmacyDrugData(data);
  };

  const [selectedPharmacyDrug, setSelectedPharmacyDrug] =
    useState<IPharmacyDrugByPharmacy>();

  return (
    <div className="p-[2px] w-[70%] border-separate overflow-clip rounded-xl border border-solid flex flex-col h-[82vh]">
      {openModal.edit && (
        <ModalEditDrugManager
          onClose={() => handleOpenModal("edit")}
          onfetchDataDrugs={onfetchDataDrugs}
          data={parmacyDrugData}
        />
      )}
      {openModal.delete && (
        <ModalDeleteDrugManager
          onfetchDataDrugs={onfetchDataDrugs}
          onClose={() => handleOpenModal("delete")}
          data={parmacyDrugData}
        />
      )}
      {selectedPharmacyDrug && openModal.request && (
        <ManagerRequestStock
          onConfirm={() => onfetchDataDrugs()}
          drug={selectedPharmacyDrug}
          onClose={() => {
            setSelectedPharmacyDrug(undefined);
            handleOpenModal("request");
          }}
        ></ManagerRequestStock>
      )}
      <div className="flex justify-between ">
        <div className=" relative text-gray-600 flex items-center gap-1">
          <p>Drug Name</p>
          <input
            className="border-2 border-gray-300 bg-white h-9 px-5 pr-16 rounded-lg text-sm focus:outline-none "
            type="search"
            name="search"
            placeholder="Search"
            onChange={handleInputChange}
          />
          <button type="submit" className="absolute right-0 top-3 mr-4">
            <FaSearch />
          </button>
        </div>
        <button className="py-[2px] px-[10px] border-2 border-slate-600 rounded-[8px] ml-1">
          <IoMdDownload></IoMdDownload>
        </button>
      </div>
      <table className="w-[calc(100%-10px)] table-fixed">
        <thead className="border-b-2 border-slate-600 sticky top-0">
          <tr>
            <th className="w-[45%]">Drug Info</th>
            <th className="w-[20%]">Price</th>
            <th className="w-[20%]">Stock</th>
            <th className="w-[15%}">Action</th>
          </tr>
        </thead>
      </table>
      <div
        className="w-[100%] flex-1 overflow-y-auto scroll-smooth"
        style={{ scrollbarWidth: "thin" }}
        id="manager-drugs-table"
      >
        <table className="w-[100%] table-fixed">
          <tbody>
            {drugs?.map((drug) => (
              <tr
                className="border-b-2 h-[150px] border-slate-400"
                key={drug.pharmacy_drug_id}
              >
                <th className="w-[45%]">
                  <div className="flex items-center p-[5px] gap-[10px]">
                    <img
                      className="h-[100px] aspect-square object-cover"
                      alt=""
                      src={drug.drug.image}
                    ></img>
                    <article className="text-left">
                      <p className="text-[16px] font-[500] w-[400px] truncate">
                        Product name: <b>{drug.drug.name}</b>
                      </p>
                      <p className="text-[16px] font-[500]">
                        Generic name: <b>{drug.drug.genericName || "-"}</b>
                      </p>
                      <p className="text-[16px] font-[500]">
                        Manufacture: <b>{drug.drug.manufacture}</b>
                      </p>
                    </article>
                  </div>
                </th>
                <th className="w-[20%]">
                  <p>{CurrencyFormatter.format(drug.price)}</p>
                </th>
                <th className="w-[20%]">
                  <p className={`${drug.stock < 1 && "text-[#E64A4A]"}`}>
                    {drug.stock > 0 ? drug.stock : "Sold Out"}
                  </p>
                </th>
                <th>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        handleOpenModal("edit");
                        handleSetPharmacyDrugId(drug);
                      }}
                      className="middle none center rounded-lg bg-blue-500 py-2 px-4 hover:scale-105 font-sans text-xs font-bold uppercase text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                    >
                      Edit Product
                    </button>
                    <button
                      onClick={() => {
                        handleOpenModal("delete");
                        handleSetPharmacyDrugId(drug);
                      }}
                      className="middle none center rounded-lg bg-red-500 py-2 px-4 hover:scale-105 font-sans text-xs font-bold uppercase text-white shadow-md shadow-red-500/20 transition-all hover:shadow-lg hover:shadow-red-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => {
                        handleOpenModal("request");
                        handleSetPharmacyDrugId(drug);
                        setSelectedPharmacyDrug(drug);
                      }}
                      className="px-[10px] py-[3px] border-2 border-slate-400 rounded-[8px]"
                    >
                      Request Stock
                    </button>
                  </div>
                </th>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-row w-[100%] justify-between p-2 ">
        <button
          className={`text-blue-900 p-2 border-2 rounded-md text-[15px] ${
            pageInfo?.page === 1 ? "bg-gray-200 text-gray-700" : "bg-sky-300"
          }`}
          onClick={() => handlePageChange("left")}
          disabled={pageInfo?.page === 1}
        >
          <FaArrowLeft />
        </button>
        <button
          className={`text-blue-900 p-2 border-2 rounded-md text-[15px] ${
            pageInfo?.page === pageInfo?.page_count
              ? "bg-gray-300"
              : "bg-sky-300"
          }`}
          onClick={() => handlePageChange("right")}
          disabled={pageInfo?.page === pageInfo?.page_count}
        >
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default ManagerDrugsTable;
