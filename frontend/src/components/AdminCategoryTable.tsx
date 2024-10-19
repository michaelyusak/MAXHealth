import React, { useCallback, useContext, useEffect, useState } from "react";
import { CategoryData } from "../interfaces/Category";
import { HandleDelete, HandleGet } from "../util/API";
import { HandleShowToast } from "../util/ShowToast";
import { ToastContext } from "../contexts/ToastData";
import { IoMdAdd } from "react-icons/io";
import AdminCategoryForm from "./AdminCategoryForm";
import { useNavigate } from "react-router-dom";
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";

const AdminCategoryTable = (): React.ReactElement => {
  const navigate = useNavigate();
  const { setToast } = useContext(ToastContext);

  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getAllCategory = useCallback(() => {
    const url = import.meta.env.VITE_HTTP_BASE_URL +  "/categories/";

    setIsLoading(true);

    HandleGet<CategoryData[]>(url)
      .then((data) => {
        setCategories(data);
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 5);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [setToast]);

  useEffect(() => {
    getAllCategory();
  }, [getAllCategory]);

  const [inputValues, setInputValues] = useState<{
    [key: string]: {
      value: string | number;
      error: string;
      file?: File;
    };
  }>();

  const [editCategory, setEditCategory] = useState<boolean>(false);
  const [addCategory, setAddCategory] = useState<boolean>(false);

  function handleOpenAddModal() {
    setInputValues({
      ["name"]: { value: "", error: "" },
      ["image"]: { value: "", error: "" },
    });

    setAddCategory(true);
  }

  function handleCloseAddModal() {
    setInputValues(undefined);

    setAddCategory(false);
  }

  function handleOpenEditModal(category: CategoryData) {
    setInputValues({
      ["id"]: { value: category.category_id, error: "" },
      ["name"]: { value: category.category_name, error: "" },
      ["image"]: { value: category.category_url, error: "" },
    });

    setEditCategory(true);
  }

  function handleCloseEditModal() {
    setInputValues(undefined);

    setEditCategory(false);
  }

  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);

  const [deleteId, setDeleteId] = useState<number>();

  function handleOpenDeleteConfirmation(id: number) {
    setShowDeleteConfirmation(true);

    setDeleteId(id);
  }

  function handleDeleteCategory() {
    const url = import.meta.env.VITE_HTTP_BASE_URL +  `/categories/${deleteId}`;

    setIsLoading(true);
    HandleDelete(url, true)
      .then(() => {
        HandleShowToast(setToast, true, "Delete success", 5);
        setShowDeleteConfirmation(false);
        getAllCategory();
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
  }

  const [searchKey, setSearchKey] = useState<string>("");

  const [filteredCategories, setFilteredCategories] = useState<CategoryData[]>(
    []
  );

  useEffect(() => {
    const filtered: CategoryData[] = [];

    categories.forEach((cat) => {
      if (cat.category_name.toLowerCase().includes(searchKey.toLowerCase())) {
        filtered.push(cat);
      }
    });

    setFilteredCategories(filtered);
  }, [searchKey, categories]);

  return (
    <>
      <div className="w-[30%] gap-[10px] p-[5px] border-separate overflow-clip rounded-xl border border-solid flex flex-col h-full">
        <div className="flex pb-[5px] justify-between border-b-2 border-slate-400">
          <h1 className="text-[20px] font-[600]">Categories</h1>
          <div className="flex gap-[10px]">
            <input
              type="text"
              className="h-[30px] gap-[5px] focus:outline-0 p-[5px] pr-[5px] bg-white w-[180px] rounded-[8px] border-2 border-slate-800 justify-between items-center"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              placeholder="Insert category name ..."
            ></input>
            <button
              onClick={() => handleOpenAddModal()}
              className="px-[10px] rounded-[8px] border-2 border-slate-600 flex items-center gap-[5px]"
            >
              <IoMdAdd></IoMdAdd>
              <p>Add Category</p>
            </button>
          </div>
        </div>

        {showDeleteConfirmation && (
          <>
            <div className="w-[100%] h-[100%] absolute z-[50] top-0 left-0 rounded-xl bg-gray-300 opacity-[0.75]"></div>
            <div className="w-[20%] h-[15%] absolute z-[50] top-[50%] left-[50%] justify-between items-center flex flex-col translate-x-[-50%] rounded-xl translate-y-[-50%] bg-[#DFF1FD] p-[30px]">
              <p className="text-[18px] text-center font-[600]">
                Are you sure to delete this category?
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
                  onClick={() => handleDeleteCategory()}
                >
                  Yes
                </button>
              </div>
            </div>
          </>
        )}

        <div
          className="h-[100%] border-[1px] bg-[#DFF1FD] border-slate-400 rounded-xl flex flex-col gap-[10px] overflow-y-auto p-[10px]"
          style={{ scrollbarWidth: "thin" }}
        >
          {isLoading ? (
            <>
              <div className="w-[100%] h-[230px] bg-white rounded-xl animate-pulse"></div>
              <div className="w-[100%] h-[230px] bg-white rounded-xl animate-pulse"></div>
              <div className="w-[100%] h-[230px] bg-white rounded-xl animate-pulse"></div>
              <div className="w-[100%] h-[230px] bg-white rounded-xl animate-pulse"></div>
              <div className="w-[100%] h-[230px] bg-white rounded-xl animate-pulse"></div>
              <div className="w-[100%] h-[140px] bg-white rounded-xl animate-pulse"></div>
            </>
          ) : (
            filteredCategories.map((category) => (
              <div
                key={category.category_id}
                className="flex h-[150px] justify-between items-center bg-white p-[10px] rounded-xl"
              >
                <img
                  alt=""
                  src={category.category_url}
                  className="w-[100px] h-[100px] object-cover rounded-xl"
                ></img>
                <div className="flex justify-between gap-[10px] w-[50%]">
                  <p className="text-left font-[600]">
                    {category.category_name}
                  </p>
                </div>
                <div className="flex flex-col justify-center gap-[10px]">
                  <button
                    onClick={() => handleOpenEditModal(category)}
                    className="middle none center rounded-lg bg-blue-500 py-2 px-4 hover:scale-105 font-sans text-xs font-bold uppercase text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      handleOpenDeleteConfirmation(category.category_id)
                    }
                    className="middle none center rounded-lg bg-red-500 py-2 px-4 hover:scale-105 font-sans text-xs font-bold uppercase text-white shadow-md shadow-red-500/20 transition-all hover:shadow-lg hover:shadow-red-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {(editCategory || addCategory) && inputValues && (
        <AdminCategoryForm
          purpose={editCategory ? "update" : "add"}
          inputValues={inputValues}
          onAction={() => getAllCategory()}
          setInputValues={setInputValues}
          handleClose={() =>
            editCategory ? handleCloseEditModal() : handleCloseAddModal()
          }
        ></AdminCategoryForm>
      )}
    </>
  );
};

export default AdminCategoryTable;
