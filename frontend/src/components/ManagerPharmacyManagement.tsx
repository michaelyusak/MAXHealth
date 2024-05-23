import React, { useCallback, useContext, useEffect, useState } from "react";
import { HandleDelete, HandleGet } from "../util/API";
import {
  pharmacyData,
  pharmacyDataResponse,
} from "../interfaces/pharmacyManagers";
import { ToastContext } from "../contexts/ToastData";
import { HandleShowToast } from "../util/ShowToast";
import ModalAddPharmacy from "./ModalEditPharmacy";
import ModalDeletePharmacy from "./ModalDeletePharmacy";

type ManagerPharmacyManagementProps = {
  page: number;
  onTotalPage: (totalpage: number) => void;
  limit: string;
  OnSearch: string;
};

const ManagerPharmacyManagement = ({
  OnSearch,
  limit,
  page,
  onTotalPage,
}: ManagerPharmacyManagementProps): React.ReactElement => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataPharmacy, setDataPharmacy] = useState<pharmacyDataResponse>();
  const { setToast } = useContext(ToastContext);
  const [openModal, setOpenModal] = useState({
    editPharmacy: false,
    deletePharmacy: false,
  });
  const [dataPharmacyEdit, setDataPharmacyEdit] = useState<pharmacyData>();
  const fetchDataPharmacy = useCallback(() => {
    const url = import.meta.env.VITE_DEPLOYMENT_URL +  `/managers/pharmacies?search=${OnSearch}&page=${page}&limit=${limit}`;

    setIsLoading(true);
    HandleGet<pharmacyDataResponse>(url, true)
      .then((data) => {
        setDataPharmacy(data);
        onTotalPage(data.page_info.page_count);
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 5);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [setToast, page, limit, onTotalPage, OnSearch]);

  const handleDelete = () => {
    const url = import.meta.env.VITE_DEPLOYMENT_URL + `/pharmacies/${dataPharmacyEdit?.id}`;

    setIsLoading(true);
    HandleDelete(url, true)
      .then(() => {
        fetchDataPharmacy();
        handleOpenModal("delete");
        HandleShowToast(setToast, true, "delete pharmacy success", 5);
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 5);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchDataPharmacy();
  }, [fetchDataPharmacy]);

  const handleOpenModal = (type: string) => {
    if (type === "edit") {
      setOpenModal({ ...openModal, editPharmacy: !openModal.editPharmacy });
    } else {
      setOpenModal({ ...openModal, deletePharmacy: !openModal.deletePharmacy });
    }
  };

  const handleSetEditDataPharmacy = (data: pharmacyData) => {
    setDataPharmacyEdit(data);
  };

  {
    isLoading && <p>Loading....</p>;
  }

  return (
    <div className="w-[100%]">
      {openModal.editPharmacy && (
        <ModalAddPharmacy
          onClose={() => handleOpenModal("edit")}
          dataPharmacy={dataPharmacyEdit}
          onFetch={fetchDataPharmacy}
        />
      )}
      {openModal.deletePharmacy && (
        <ModalDeletePharmacy
          onClose={() => handleOpenModal("delete")}
          dataPharmacy={dataPharmacyEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      )}
      <table className="border-2 p-5 w-[100%]">
        <div className="h-[67vh] overflow-auto ">
          <thead>
            <tr className="">
              <th className="p-2 text-start w-[20%]">Pharmacy Name</th>
              <th className="p-2 w-[16%]">Pharmacist Name</th>
              <th className="p-2 w-[16%]">Pharmacist License Number</th>
              <th className="p-2 w-[16%]">Pharmacist Phone Number</th>
              <th className="p-2 w-[8%]">City</th>
              <th className="p-2 flex-1 w-[50%]">Address</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          {dataPharmacy?.pharmacies.map((pharmacy) => (
            <tbody className="text-center border-2 text-[16px] text-[#484747]">
              <tr className="bg-white rounded-lg">
                <td className="p-2 text-start ">{pharmacy.pharmacy_name}</td>
                <td className="p-2">{pharmacy.pharmacist_name}</td>
                <td className="p-2">{pharmacy.pharamcist_license_name}</td>
                <td className="p-2">{pharmacy.pharmacist_phone_number}</td>
                <td className="p-2">{pharmacy.city}</td>
                <td className="px-2 line-clamp-3">{pharmacy.address}</td>
                <td className="p-2">
                  <div className="flex flex-row justify-center gap-1">
                    <button
                      onClick={() => {
                        handleOpenModal("edit");
                        handleSetEditDataPharmacy(pharmacy);
                      }}
                      className="middle none center rounded-lg bg-blue-500 py-2 px-4 hover:scale-105 font-sans text-xs font-bold uppercase text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        handleOpenModal("delete");
                        handleSetEditDataPharmacy(pharmacy);
                      }}
                      className="middle none center rounded-lg bg-red-500 py-2 px-4 hover:scale-105 font-sans text-xs font-bold uppercase text-white shadow-md shadow-red-500/20 transition-all hover:shadow-lg hover:shadow-red-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          ))}
        </div>
      </table>
    </div>
  );
};

export default ManagerPharmacyManagement;
