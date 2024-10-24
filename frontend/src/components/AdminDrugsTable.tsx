import React, { useCallback, useContext, useEffect, useState } from "react";
import { IAdminDrugsCapital, IDrugCapital } from "../interfaces/Drug";
import PaginationInfo from "./PaginationInfo";
import { IoMdAdd } from "react-icons/io";
import { HandleDelete, HandleGet } from "../util/API";
import { HandleShowToast } from "../util/ShowToast";
import { ToastContext } from "../contexts/ToastData";
import AdminDrugForm from "./AdminDrugForm";
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";
import { useNavigate } from "react-router-dom";
import { pageInfo } from "../interfaces/pharmacyManagers";

const AdminDrugsTable = (): React.ReactElement => {
  const navigate = useNavigate();
  const { setToast } = useContext(ToastContext);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [drugsData, setDrugsData] = useState<IAdminDrugsCapital>();
  const [pageInfo, setPageInfo] = useState<pageInfo>();
  const [page, setPage] = useState<number>(1);
  const [itemPerPage, setItemPerPage] = useState<string>("20");
  const [drugsSearchParam, setDrugsSearchParam] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const fetchDataDrugs = useCallback(() => {
    const url =
      import.meta.env.VITE_HTTP_BASE_URL +
      `/admin/drugs?page=${page}&limit=${itemPerPage}&search=${drugsSearchParam}`;
    setIsLoading(true);

    HandleGet<IAdminDrugsCapital>(url, true)
      .then((data) => {
        setDrugsData(data);
        setPageInfo(data.page_info);
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 5);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [setToast, page, itemPerPage, drugsSearchParam]);

  useEffect(() => {
    fetchDataDrugs();
  }, [fetchDataDrugs]);

  const [inputValues, setInputValues] = useState<{
    [key: string]: {
      value: string | number;
      error: string;
      isTrue?: boolean;
      file?: File;
    };
  }>();

  function handleOpenEditModal(drug: IDrugCapital) {
    setInputValues({
      ["id"]: { value: drug.Id, error: "" },
      ["name"]: { value: drug.Name, error: "" },
      ["genericName"]: { value: drug.GenericName, error: "" },
      ["manufacture"]: { value: drug.Manufacture, error: "" },
      ["content"]: { value: drug.Content, error: "" },
      ["description"]: { value: drug.Description, error: "" },
      ["formId"]: { value: drug.Form.Id, error: "" },
      ["classificationId"]: {
        value: drug.Classification.Id,
        error: "",
      },
      ["categoryId"]: { value: drug.Category.Id, error: "" },
      ["unitInPack"]: { value: drug.UnitInPack, error: "" },
      ["sellingUnit"]: { value: drug.SellingUnit, error: "" },
      ["weight"]: { value: drug.Weight, error: "" },
      ["height"]: { value: drug.Height, error: "" },
      ["length"]: { value: drug.Length, error: "" },
      ["width"]: { value: drug.Width, error: "" },
      ["image"]: { value: drug.Image, error: "" },
      ["isActive"]: { value: "", error: "", isTrue: drug.isActive },
      ["isPrescriptionRequired"]: {
        value: "",
        error: "",
        isTrue: drug.isPrescriptionRequired,
      },
    });

    setEditDrug(true);
  }

  function handleCloseEditModal() {
    setInputValues(undefined);

    setEditDrug(false);
  }

  const [editDrug, setEditDrug] = useState<boolean>(false);
  const [addDrug, setAddDrug] = useState<boolean>(false);

  function handleOpenAddModal() {
    setInputValues({
      ["id"]: { value: "", error: "" },
      ["name"]: { value: "", error: "" },
      ["genericName"]: { value: "", error: "" },
      ["manufacture"]: { value: "", error: "" },
      ["content"]: { value: "", error: "" },
      ["description"]: { value: "", error: "" },
      ["formId"]: { value: 1, error: "" },
      ["classificationId"]: {
        value: 1,
        error: "",
      },
      ["categoryId"]: { value: 1, error: "" },
      ["unitInPack"]: { value: "", error: "" },
      ["sellingUnit"]: { value: "", error: "" },
      ["weight"]: { value: 0, error: "" },
      ["height"]: { value: 0, error: "" },
      ["length"]: { value: 0, error: "" },
      ["width"]: { value: 0, error: "" },
      ["image"]: { value: "", error: "" },
      ["isActive"]: { value: "", error: "", isTrue: true },
      ["isPrescriptionRequired"]: {
        value: "",
        error: "",
        isTrue: false,
      },
    });

    setAddDrug(true);
  }

  function handleCloseAddModal() {
    setInputValues(undefined);

    setAddDrug(false);
  }

  const [deleteId, setDeleteId] = useState<number>();

  function handleOpenDeleteConfirmation(id: number) {
    setShowDeleteConfirmation(true);

    setDeleteId(id);
  }

  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);

  function handleDeleteDrug() {
    HandleDelete(
      import.meta.env.VITE_HTTP_BASE_URL + `/admin/drugs/${deleteId}`,
      true
    )
      .then(() => {
        HandleShowToast(setToast, true, "Drug delete success", 5);

        fetchDataDrugs()
      })
      .catch((error: Error) => {
        if (error.message == MsgRefreshTokenNotFound) {
          navigate("/auth/login");
        }

        HandleShowToast(setToast, false, error.message, 5);
      });
  }

  {
    isLoading && <p>Loading ....</p>;
  }

  return (
    <>
      <div className="w-[69%] gap-[10px] p-[5px] border-separate overflow-clip rounded-xl border border-solid flex flex-col justify between h-full">
        <div className="flex pb-[5px] justify-between border-b-2 border-slate-400">
          <h1 className="text-[20px] font-[600]">Drugs</h1>
          <div className="flex gap-[10px]">
            <input
              type="text"
              className="h-[30px] gap-[5px] focus:outline-0 p-[5px] pr-[5px] bg-white w-[180px] rounded-[8px] border-2 border-slate-800 justify-between items-center"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  setPage(1);
                  setDrugsSearchParam(search);
                }
              }}
              placeholder="Insert name product..."
            ></input>
            <button
              onClick={() => handleOpenAddModal()}
              className="px-[20px] rounded-[8px] border-2 border-slate-600 flex items-center gap-[5px]"
            >
              <IoMdAdd></IoMdAdd>
              <p>Add Drug</p>
            </button>
          </div>
        </div>

        {showDeleteConfirmation && (
          <>
            <div className="w-[100%] h-[100%] absolute z-[50] top-0 left-0 rounded-xl bg-gray-300 opacity-[0.75]"></div>
            <div className="w-[20%] h-[15%] absolute z-[50] top-[50%] left-[50%] justify-between items-center flex flex-col translate-x-[-50%] rounded-xl translate-y-[-50%] bg-[#DFF1FD] p-[30px]">
              <p className="text-[18px] text-center font-[600]">
                Are you sure want to delete this drug?
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
                  onClick={() => handleDeleteDrug()}
                >
                  Yes
                </button>
              </div>
            </div>
          </>
        )}

        <div
          className="bg-[#DFF1FD] h-full overflow-auto"
          style={{ scrollbarWidth: "thin" }}
        >
          <div className="h-[100%] p-[10px] justify-items-start content-start border-[1px] grid grid-cols-[repeat(auto-fit,_minmax(510px,_1fr))] border-slate-400 rounded-xl gap-[10px]">
            {drugsData?.drugs.map((drug) => (
              <div className="w-[510px] p-[10px] h-[150px] gap-[10px] items-center bg-white rounded-xl flex">
                <img
                  alt=""
                  src={drug.Image}
                  className="w-[130px] h-[130px] object-cover rounded-xl"
                ></img>
                <div className="flex flex-col w-full justify-center items-left">
                  <p className="text-[20px] font-[600]">{drug.Name}</p>
                  <p className="font-[600]">{drug.Classification.Name}</p>
                </div>
                <div className="flex flex-col justify-center gap-[10px]">
                  <button
                    onClick={() => handleOpenEditModal(drug)}
                    className="middle none center rounded-lg bg-blue-500 py-2 px-4 hover:scale-105 font-sans text-xs font-bold uppercase text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleOpenDeleteConfirmation(drug.Id)}
                    className="middle none center rounded-lg bg-red-500 py-2 px-4 hover:scale-105 font-sans text-xs font-bold uppercase text-white shadow-md shadow-red-500/20 transition-all hover:shadow-lg hover:shadow-red-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="ml-[auto]">
          <PaginationInfo
            totalPage={pageInfo?.page_count ?? 1}
            activePage={page}
            setPage={(value) => setPage(value)}
            minItemPerPage={4}
            maxItemPerPage={40}
            stepItemPerPage={4}
            itemPerPage={parseInt(itemPerPage)}
            setItemPerPage={(value) => setItemPerPage(value)}
            withItemPerPage={true}
          ></PaginationInfo>
        </div>
      </div>
      {editDrug && inputValues && (
        <AdminDrugForm
          refetch={() => fetchDataDrugs()}
          purpose="update"
          inputValues={inputValues}
          setInputValues={(inputValues) => setInputValues(inputValues)}
          handleClose={() => handleCloseEditModal()}
        ></AdminDrugForm>
      )}
      {addDrug && inputValues && (
        <AdminDrugForm
          refetch={() => fetchDataDrugs()}
          purpose="add"
          inputValues={inputValues}
          setInputValues={(inputValues) => setInputValues(inputValues)}
          handleClose={() => handleCloseAddModal()}
        ></AdminDrugForm>
      )}
    </>
  );
};

export default AdminDrugsTable;
