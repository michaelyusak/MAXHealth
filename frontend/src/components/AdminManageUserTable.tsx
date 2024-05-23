import React, { useCallback, useContext, useEffect, useState } from "react";
import Button from "./Button";
import { FaPlus, FaSearch } from "react-icons/fa";
import { IconContext } from "react-icons";
import ModalAddUser from "./ModalAddUser";
import ModalAdminEditUser from "./ModalAdminEditUser";
import {
  pharmacyDataResponse,
  pharmacyManagers,
} from "../interfaces/pharmacyManagers";
import { HandleDelete, HandleGet } from "../util/API";
import { HandleShowToast } from "../util/ShowToast";
import { ToastContext } from "../contexts/ToastData";
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";
import { useNavigate } from "react-router-dom";
import ModalAdminAddPharmacy from "./ModalAdminAddPharmacy";

type Partner = {
  id: number;
  name: string;
  email: string;
  profile_picture: string;
};

type tableProps = {
  page: number;
  onTotalPage: (totalpage: number) => void;
  limit: string;
};

const AdminManageUserTable = ({
  page,
  onTotalPage,
  limit,
}: tableProps): React.ReactElement => {
  const navigate = useNavigate();

  const [dataPartner, setDataPartner] = useState<pharmacyManagers>();
  const [openModal, setOpenModal] = useState({
    add: false,
    editUser: false,
    addPharmacy: false,
  });
  const [dataPharmacy, setDataPharmacy] = useState<pharmacyDataResponse>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setToast } = useContext(ToastContext);
  const [selectPartner, setSelectPartner] = useState<number>();
  const [dataEditPartner, setDataEditPartner] = useState<Partner | undefined>();
  const handleSelectPartner = (id: number) => {
    setSelectPartner(id);
  };
  const [searchData, setSearchData] = useState<string>("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchData(event.target.value);
  };

  const handleSearchUser = () => {
    const url =
      import.meta.env.VITE_DEPLOYMENT_URL +
      `/admin/manager/${selectPartner}/pharmacies?search=${searchData}`;
    setIsLoading(true);

    HandleGet<pharmacyDataResponse>(url, true)
      .then((data) => {
        setDataPharmacy(data);
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 5);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleDeletePartner = (id: number) => {
    const url = import.meta.env.VITE_DEPLOYMENT_URL + `/partners/${id}`;
    setIsLoading(true);
    HandleDelete<pharmacyManagers>(url, true)
      .then(() => {
        fetchDataPartner();
        HandleShowToast(setToast, true, "delete manager success", 5);
      })
      .catch((error: Error) => {
        if (error.message == MsgRefreshTokenNotFound) {
          navigate("/auth/login");
        }
        HandleShowToast(setToast, false, error.message, 5);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const fetchDataPartner = useCallback(() => {
    const url = import.meta.env.VITE_DEPLOYMENT_URL + "/partners";
    setIsLoading(true);
    HandleGet<pharmacyManagers>(url, true)
      .then((data) => {
        setDataPartner(data);
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 5);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [setToast]);

  const fetchDataPharmacy = useCallback(() => {
    if (selectPartner) {
      const url =
        import.meta.env.VITE_DEPLOYMENT_URL +
        `/admin/manager/${selectPartner}/pharmacies?page=${page}&limit=${limit}`;
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
    }
  }, [setToast, selectPartner, page, onTotalPage, limit]);

  useEffect(() => {
    fetchDataPartner();
    fetchDataPharmacy();
  }, [fetchDataPharmacy, fetchDataPartner]);

  const handleOpenModal = (type: string) => {
    if (type === "add") {
      setOpenModal({ ...openModal, add: !openModal.add });
    } else if (type === "editUser") {
      setOpenModal({ ...openModal, editUser: !openModal.editUser });
    } else {
      setOpenModal({ ...openModal, addPharmacy: !openModal.addPharmacy });
    }
  };

  const handleEditUser = (data: Partner) => {
    setDataEditPartner(data);
  };

  return (
    <>
      {openModal.add && (
        <ModalAddUser
          onClose={() => handleOpenModal("add")}
          onFetch={fetchDataPartner}
        />
      )}
      {openModal.editUser && (
        <ModalAdminEditUser
          onClose={() => handleOpenModal("editUser")}
          onFetch={fetchDataPartner}
          data={dataEditPartner}
        />
      )}
      {openModal.addPharmacy && (
        <ModalAdminAddPharmacy
          onClose={() => handleOpenModal("addPharmacy")}
          onFetch={fetchDataPartner}
          data={dataEditPartner}
        />
      )}
      {showDeleteConfirmation && (
        <>
          <div className="w-[100vw] h-[100vh] absolute z-[50] top-[0] left-[0] rounded-xl  bg-white opacity-[0.75]"></div>
          <div className="w-[20%] h-[18%] absolute z-[50] top-[50%] left-[50%] justify-between items-center flex flex-col translate-x-[-50%] rounded-xl translate-y-[-50%] bg-[#DFF1FD] p-[30px]">
            <p className="text-[18px] text-center font-[600]">
              Are you sure want to delete this Pharmacy Manager?
            </p>
            <div className="flex w-full justify-between">
              <button
                className="px-[20px] py-[3px] rounded-[8px] font-[600] text-white bg-[#FF0000]"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                No
              </button>
              <button
                className="px-[20px] py-[3px] rounded-[8px] font-[600] text-white bg-[#1F5FFF]"
                onClick={() => {
                  if (selectPartner) {
                    handleDeletePartner(selectPartner);
                    setShowDeleteConfirmation(false);
                  }
                }}
              >
                Yes
              </button>
            </div>
          </div>
        </>
      )}
      <div className="flex flex-col gap-6 h-[75vh]">
        <div className="flex items-center justify-between bg-[#dff1fd] rounded-lg">
          <div className="p-2">
            <Button
              type="button"
              buttonStyle="add-user"
              onClick={() => handleOpenModal("add")}
              additionalClassName="px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-[#8ddd94]"
            >
              add User <FaPlus />
            </Button>
          </div>
          <div className="flex items-center gap-2 p-2">
            <div className="flex items-center justify-between bg-gray-100 rounded-[8px] py-[1px] px-[7px]">
              <input
                placeholder="Enter Pharmacy Name"
                className="text-black py-2 w-[100%] px-3 bg-transparent focus:outline-0"
                value={searchData}
                onChange={handleOnChange}
              />
              <button
                type="button"
                className="text-2xl"
                onClick={handleSearchUser}
              >
                <IconContext.Provider value={{ color: "#000D44" }}>
                  <FaSearch />
                </IconContext.Provider>
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-row gap-3">
          <div className="flex flex-col w-[30%] gap-2 overflow-auto h-[67vh]">
            <h2 className="border-b-2 py-2 text-[18px] font-bold capitalize border-black">
              Pharmacy Managers
            </h2>
            <div className="flex flex-col gap-1">
              {dataPartner &&
                dataPartner.partners &&
                dataPartner.partners.map((data) => (
                  <div
                    className={`py-3 hover:cursor-pointer flex flex-row items-center gap-1 ${
                      selectPartner == data.id ? "bg-gray-200" : "bg-white"
                    }`}
                    key={data.id}
                    onClick={() => handleSelectPartner(data.id)}
                  >
                    {isLoading ? (
                      <svg
                        aria-hidden="true"
                        className="w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600 mx-auto my-[50%] justify-center items-center"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="currentColor"
                        />
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="currentFill"
                        />
                      </svg>
                    ) : (
                      <>
                        <img
                          className="w-[150px] h-[150px] object-cover object-center rounded-lg"
                          src={data.profile_picture}
                        />
                        <div className="flex flex-col flex-1 gap-1">
                          <p className="text-[18px] font-semibold capitalize text-gray-600">
                            {data.name}
                          </p>
                          <p className="text-gray-600 font-light">
                            {data.email}
                          </p>
                          <div className="m-[auto] w-[80%] pr-2 flex flex-row justify-center gap-[10px] items-center">
                            <button
                              onClick={() => {
                                handleOpenModal("editUser");
                                handleEditUser(data);
                              }}
                              className="flex-1 middle none center rounded-lg bg-blue-500 py-2 px-4 hover:scale-105 font-sans text-xs font-bold uppercase text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setShowDeleteConfirmation(true);
                                handleSelectPartner(data.id);
                              }}
                              className="flex-1 middle none center rounded-lg bg-red-500 py-2 px-4 hover:scale-105 font-sans text-xs font-bold uppercase text-white shadow-md shadow-red-500/20 transition-all hover:shadow-lg hover:shadow-red-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                            >
                              Delete
                            </button>
                          </div>
                          <button
                            onClick={() => {
                              handleEditUser(data);
                              handleOpenModal("addPharmacy");
                            }}
                            className="hover:scale-105 hover:bg-gray-100 w-[50%] px-[5px] py-[3px] border-2 border-slate-400 rounded-[8px] mx-auto mt-1 h-[auto] text-[14px]"
                          >
                            Add Pharmacy
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
            </div>
          </div>
          <div className="flex-1 overflow-auto h-[67vh] relative">
            <table className="border-2 p-5 w-[100%] ">
              <thead className="text-[18px] font-bold capitalize">
                <tr>
                  <th className="p-2 text-start">Pharmacy Name</th>
                  <th className="p-2">Phone Number</th>
                  <th className="p-2">Address</th>
                  <th className="p-2">City</th>
                </tr>
              </thead>
              {dataPharmacy &&
                dataPharmacy.pharmacies &&
                dataPharmacy.pharmacies.map((pharmacy) => (
                  <tbody
                    className=" border-2 text-[16px] text-[#484747] font-semibold w-[100%]"
                    key={pharmacy.id}
                  >
                    {isLoading ? (
                      <svg
                        aria-hidden="true"
                        className="w-7 h-7 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600 mx-auto my-[50%] justify-center items-center"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="currentColor"
                        />
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="currentFill"
                        />
                      </svg>
                    ) : (
                      <>
                        <tr className="bg-white rounded-lg">
                          <td className="p-2 text-start ">
                            <p>{pharmacy.pharmacy_name}</p>
                          </td>
                          <td className="p-2 text-center">
                            {pharmacy.pharmacist_phone_number}
                          </td>
                          <td className="p-2 text-center">
                            {pharmacy.address}
                          </td>
                          <td className="p-2 text-center">{pharmacy.city}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                ))}
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminManageUserTable;
