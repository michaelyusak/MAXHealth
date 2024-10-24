import React, { useContext, useEffect, useState } from "react";
import { IGetDrugResponse } from "../interfaces/Drug";
import { HandleGet } from "../util/API";
import { ToastContext } from "../contexts/ToastData";
import { HandleShowToast } from "../util/ShowToast";
import { LuFilter } from "react-icons/lu";
import PaginationInfo from "./PaginationInfo";
import { IoClose } from "react-icons/io5";
import ItemSelector from "./ItemSelector";
import { CategoryData } from "../interfaces/Category";
import { FaMinus, FaPlus } from "react-icons/fa";

type createPrescriptionModal = {
  handleCancel: () => void;
  handleConfirm: (values: {
    [key: number]: {
      name: string;
      image: string;
      quantity: number;
      note: string;
    };
  }) => void;
};

const CreatePrescriptionModal = ({
  handleCancel,
  handleConfirm,
}: createPrescriptionModal): React.ReactElement => {
  const { setToast } = useContext(ToastContext);

  const [drugs, setDrugs] = useState<IGetDrugResponse[]>([]);
  const [pageInfo, setPageInfo] = useState<{
    page_count: number;
    item_count: number;
    page: number;
  }>({ page_count: 1, item_count: 1, page: 1 });
  const [searchParam, setSearchParam] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [itemPerPage, setItemPerPage] = useState<number>(10);

  useEffect(() => {
    const url = import.meta.env.VITE_HTTP_BASE_URL +  `/admin/drugs?search=${searchParam}&page=${page}&limit=${itemPerPage}`;

    HandleGet<{
      drugs: IGetDrugResponse[];
      page_info: { page_count: number; item_count: number; page: number };
    }>(url, true)
      .then((responseData) => {
        setDrugs(responseData.drugs);
        setPageInfo(responseData.page_info);
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 5);
      });
  }, [setToast, searchParam, page, itemPerPage]);

  useEffect(() => {
    HandleGet<CategoryData[]>(import.meta.env.VITE_HTTP_BASE_URL +  "/categories/")
      .then((responseData) => {
        setCategories(responseData);

        const categoryNameList: string[] = [];
        responseData.forEach((category: CategoryData) => {
          categoryNameList.push(category.category_name);
        });
        setCategoryNames(categoryNameList);
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 5);
      });
  }, [setToast]);

  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [categoryNames, setCategoryNames] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>();

  function getCategoryNameById(id?: number) {
    let name = "";

    categories.forEach((category) => {
      if (category.category_id == id) {
        name = category.category_name;
      }
    });

    return name;
  }

  const [prescriptedDrugs, setPrescriptedDrugs] = useState<IGetDrugResponse[]>(
    []
  );

  function appendDrug(drug: IGetDrugResponse) {
    setPrescriptedDrugs((prevList) => [...prevList, drug]);

    setPrescriptedDrugValues((prevVal) => ({
      ...prevVal,
      [drug.Id]: { name: drug.Name, image: drug.Image, quantity: 1, note: "" },
    }));
  }

  function removeDrug(drugId: number) {
    setPrescriptedDrugs((prevVal) => {
      return prevVal.filter((drug) => drug.Id != drugId);
    });
  }

  function isPrescripted(drugId: number): boolean {
    let isPrescripted = false;

    prescriptedDrugs.forEach((drug) => {
      if (drug.Id == drugId) {
        isPrescripted = true;
      }
    });

    return isPrescripted;
  }

  const [prescriptedDrugValues, setPrescriptedDrugValues] = useState<{
    [key: number]: {
      name: string;
      image: string;
      quantity: number;
      note: string;
    };
  }>({});

  const [isRemoveButtonDisabled, setIsRemoveButtonDisabled] =
    useState<boolean>(false);

  return (
    <div>
      <div className="bg-black opacity-50 w-[100vw] h-[100vh] absolute top-0 left-0 z-[20]"></div>
      <div className="h-[80%] w-[80%] p-[50px] bg-white absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-[21] rounded-2xl">
        <div className="flex flex-col h-full gap-[10px]">
          <h1 className="text-[24px] font-[600]">Create Prescription</h1>
          <div className="flex h-full justify-between">
            <div className="relative w-[59%]">
              <div
                className="w-full h-[580px] p-[5px] overflow-y-auto gap-[10px] flex flex-col border-[1px] border-black rounded-2xl"
                style={{ scrollbarWidth: "thin" }}
              >
                {showFilter && (
                  <div className="absolute right-0 top-0 py-[20px] px-[10px] items-end gap-[10px] bg-gray-200 z-[23] h-[580px] w-[40%] rounded-xl flex flex-col">
                    <button
                      onClick={() => setShowFilter(false)}
                      className="p-[5px]"
                    >
                      <IoClose></IoClose>
                    </button>
                    <div className="w-full flex flex-col gap-[5px]">
                      <input
                        type="text"
                        className="w-full p-[5px] rounded-[5px] outline-0 border-[1px] border-gray-800"
                        placeholder="input keywords..."
                        value={search}
                        onKeyDown={(e) => {
                          if (e.key == "Enter") {
                            setPage(1);
                            setSearchParam(search);
                          }
                        }}
                        onChange={(e) => setSearch(e.target.value)}
                      ></input>
                    </div>

                    <ItemSelector
                      items={categoryNames}
                      placeholder="Category"
                      value={getCategoryNameById(selectedCategoryId)}
                      setValue={(value) => {
                        categories.forEach((category) => {
                          if (category.category_name == value) {
                            setSelectedCategoryId(category.category_id);
                          }
                        });
                      }}
                      buttonAdditionalClassname="w-full"
                    ></ItemSelector>
                  </div>
                )}
                <button
                  onClick={() => setShowFilter(true)}
                  className="absolute top-[20px] opacity-100 right-[20px] z-[22] p-[5px] bg-gray-600 border-[1px] border-black rounded-[8px]"
                >
                  <LuFilter className="text-[20px] text-white"></LuFilter>
                </button>
                {drugs?.map((drug) => (
                  <div className="p-[10px] bg-gray-300 rounded-xl">
                    <div className="w-full h-full flex gap-[15px] relative">
                      <img
                        alt=""
                        src={drug.Image}
                        className="rounded-xl w-[150px] aspect-square object-cover"
                      ></img>
                      <div className="flex flex-col w-full">
                        <div className="flex gap-[30px]">
                          <p>Name:</p>
                          <p className="line-clamp-1">{drug.Name}</p>
                        </div>
                        <div className="flex gap-[30px]">
                          <p>Generic Name:</p>
                          <p>
                            {drug.GenericName == "" ? "-" : drug.GenericName}
                          </p>
                        </div>
                        <div className="flex gap-[30px]">
                          <p>Category: </p>
                          <p>{drug.Category.Name}</p>
                        </div>
                        <div className="flex gap-[30px]">
                          <p>Content: </p>
                          <p className="line-clamp-1">{drug.Content}</p>
                        </div>
                        <div className="flex gap-[30px]">
                          <p>Form: </p>
                          <p>{drug.Form.Name}</p>
                        </div>
                        <div className="flex gap-[30px]">
                          <p>Selling Unit: </p>
                          <p>{drug.SellingUnit}</p>
                        </div>
                        <div className="flex gap-[30px]">
                          <p>Unit in Pack: </p>
                          <p>{drug.UnitInPack}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => appendDrug(drug)}
                        disabled={isPrescripted(drug.Id)}
                        className="disabled:opacity-50 px-[15px] py-[10px] rounded-xl bg-[#14C57B] text-white absolute bottom-[10px] right-[10px]"
                      >
                        Add to Prescription
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="w-[40%] border-[1px] border-gray-800 h-[580px] flex flex-col gap-[5px] overflow-y-auto p-[5px] rounded-xl"
              style={{ scrollbarWidth: "thin" }}
            >
              {prescriptedDrugs.map((drug) => (
                <div className="relative p-[5px] flex justify-between bg-gray-300 rounded-[5px]">
                  <button
                    disabled={isRemoveButtonDisabled}
                    onClick={() => removeDrug(drug.Id)}
                    className="disabled:opacity-50 absolute top-[10px] right-[10px] p-[5px] bg-[#FF0000] rounded-[8px]"
                  >
                    <IoClose className="text-[24px] text-white" />
                  </button>
                  <img
                    alt=""
                    src={drug.Image}
                    className="w-[100px] aspect-square object-cover rounded-[5px]"
                  ></img>
                  <div className="flex items-center gap-[10px]">
                    <button
                      onClick={() => {
                        if (prescriptedDrugValues[drug.Id].quantity == 1) {
                          removeDrug(drug.Id);
                          return;
                        }

                        setPrescriptedDrugValues((prevVal) => ({
                          ...prevVal,
                          [drug.Id]: {
                            name: prevVal[drug.Id].name,
                            image: prevVal[drug.Id].image,
                            quantity: prevVal[drug.Id].quantity - 1,
                            note: prevVal[drug.Id].note,
                          },
                        }));
                      }}
                      className="p-[5px] disabled:opacity-50"
                      disabled={prescriptedDrugValues[drug.Id].quantity == 0}
                    >
                      <FaMinus />
                    </button>
                    <input
                      type="text"
                      value={prescriptedDrugValues[drug.Id].quantity}
                      onChange={(e) => {
                        if (isNaN(+e.target.value)) {
                          return;
                        }

                        setPrescriptedDrugValues((prevVal) => ({
                          ...prevVal,
                          [drug.Id]: {
                            name: prevVal[drug.Id].name,
                            image: prevVal[drug.Id].image,
                            quantity: +e.target.value,
                            note: prevVal[drug.Id].note,
                          },
                        }));
                      }}
                      className="px-[10px] py-[5px] text-center rounded-xl w-[50px]"
                    ></input>
                    <button
                      onClick={() => {
                        setPrescriptedDrugValues((prevVal) => ({
                          ...prevVal,
                          [drug.Id]: {
                            name: prevVal[drug.Id].name,
                            image: prevVal[drug.Id].image,
                            quantity: prevVal[drug.Id].quantity + 1,
                            note: prevVal[drug.Id].note,
                          },
                        }));
                      }}
                      className="p-[5px]"
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <textarea
                    placeholder="Note"
                    className="w-[55%] p-[5px] border-[1px] border-gray-200"
                    value={prescriptedDrugValues[drug.Id].note}
                    onFocus={() => setIsRemoveButtonDisabled(true)}
                    onBlur={() => setIsRemoveButtonDisabled(false)}
                    onChange={(e) =>
                      setPrescriptedDrugValues((prevVal) => ({
                        ...prevVal,
                        [drug.Id]: {
                          name: prevVal[drug.Id].name,
                          image: prevVal[drug.Id].image,
                          quantity: prevVal[drug.Id].quantity,
                          note: e.target.value,
                        },
                      }))
                    }
                  ></textarea>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between">
            <PaginationInfo
              totalPage={pageInfo.page_count}
              activePage={page}
              setPage={(page) => {
                setPage(page);
              }}
              withItemPerPage={true}
              itemPerPage={itemPerPage}
              setItemPerPage={(itemPerPage) => setItemPerPage(+itemPerPage)}
              minItemPerPage={10}
              maxItemPerPage={50}
              stepItemPerPage={5}
            ></PaginationInfo>
            <div className="flex gap-[10px] justify-end">
              <button
                onClick={() => handleCancel()}
                className="text-[18px] font-[600] text-white px-[10px] bg-[#FF0000] py-[5px] rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirm(prescriptedDrugValues)}
                className="text-[18px] font-[600] text-white px-[10px]  bg-[#1F5FFF] py-[5px] rounded-xl"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePrescriptionModal;
