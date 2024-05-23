import React, { useState } from "react";
import { MdAddBusiness} from "react-icons/md";
import {
  pageInfo,
  pharmacyData,
  pharmacyDataResponse,
} from "../interfaces/pharmacyManagers";
import { FaArrowLeft, FaArrowRight, FaSearch } from "react-icons/fa";
import ModalManagerAddDrug from "./ModalManagerAddDrug";
import { IPharmacyDrugByPharmacy } from "../interfaces/Drug";

type managerPharmaciesTableProps = {
  onSearchPharmacy: (searchPharmacy: string) => void;
  pharmacyData: pharmacyDataResponse | undefined;
  onSetPharmacyId: (pharmacyId: number) => void;
  selectedPharmacy: number | undefined;
  setPagePharmacy: (currentPage: number) => void;
  pageInfo: pageInfo | undefined;
  onfetchDataDrugs: () => void;
  drugsPharmacy: IPharmacyDrugByPharmacy[] |undefined;
};

const ManagerPharmaciesTable = ({
  onSearchPharmacy,
  onfetchDataDrugs,
  pharmacyData,
  onSetPharmacyId,
  selectedPharmacy,
  setPagePharmacy,
  pageInfo,
  drugsPharmacy
}: managerPharmaciesTableProps): React.ReactElement => {
  const [openModal, setOpenModal] = useState({
    add: false,
  });
  const [choosePharmacyToAddDrug, setChooseParmacyToAddDrug] = useState<
    pharmacyData | undefined
  >();
  let searchTimeout: ReturnType<typeof setTimeout> | null = null;

  const handleOpenModal = (type: string) => {
    if (type == "add") {
      setOpenModal({
        ...openModal,
        add: !openModal.add,
      });
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(() => {
      onSearchPharmacy(value);
    }, 1000);
  };

  const handleSetPharmacyDrugId = (data: pharmacyData) => {
    setChooseParmacyToAddDrug(data);
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

  return (
    <div className="p-[5px] w-[29%] border-separate overflow-clip rounded-xl border border-solid flex flex-col h-[82vh]">
      {openModal.add && (
        <ModalManagerAddDrug
          onfetchDataDrugs={onfetchDataDrugs}
          onClose={() => handleOpenModal("add")}
          data={choosePharmacyToAddDrug}
          drugsPharmacy = {drugsPharmacy}
        />
      )}
      <div className=" relative text-gray-600 flex items-center gap-1 justify-end">
        <p>Pharmacy Name</p>
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
      <table className="w-[100%] border-collapse">
        <thead className="border-b-2 border-slate-600">
          <tr>
            <th>Pharmacies</th>
          </tr>
        </thead>
      </table>
      <div className="my-[5px]"></div>
      <div
        className="flex-1 overflow-y-auto scroll-smooth relative"
        style={{ scrollbarWidth: "thin" }}
      >
        <table className="w-full table-fixed">
          <tbody>
            {pharmacyData?.pharmacies.map((pharmacy) => (
              <tr
                key={pharmacy.id}
                className={`rounded-lg ${
                  selectedPharmacy == pharmacy.id ? "bg-gray-300" : "bg-white"
                }`}
              >
                <button
                  className="flex px-[5px] border-b-[1px] border-slate-600 flex-col gap-[5px] py-[5px] items-center w-[100%]"
                  onClick={() => onSetPharmacyId(pharmacy.id)}
                >
                  <div className="w-[100%] text-left">
                    <p className="text-[16px]">
                      ID:{" "}
                      <b className="text-[16px] font-[600]">{pharmacy.id}</b>
                    </p>
                  </div>
                  <div className="flex w-[100%] justify-between items-center px-[20px]">
                    <div className="text-left flex-col gap-[5px] w-[60%]">
                      <p>{pharmacy.pharmacy_name}</p>
                      <p>{pharmacy.city}</p>
                      <div className="flex justify-between w-[100%]">
                        <p>{pharmacy.address}</p>
                        <p>{pharmacy.pharmacist_phone_number}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleOpenModal("add");
                        handleSetPharmacyDrugId(pharmacy);
                      }}
                      className="py-[3px] h-[30px] px-[10px] border-[1px] border-slate-600 rounded-[5px]"
                    >
                      <MdAddBusiness />
                    </button>
                  </div>
                </button>
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

export default ManagerPharmaciesTable;
