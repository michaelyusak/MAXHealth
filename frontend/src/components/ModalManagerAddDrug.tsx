import React, { useCallback, useContext, useEffect, useState } from "react";
import { pageInfo, pharmacyData } from "../interfaces/pharmacyManagers";
import { HandleAddRaw, HandleGet, HandlePatchBodyRaw } from "../util/API";
import {
  IDrugAdminResponse,
  IDrugCapital,
  IPharmacyDrugByPharmacy,
} from "../interfaces/Drug";
import { HandleShowToast } from "../util/ShowToast";
import { ToastContext } from "../contexts/ToastData";
import { FaPlus } from "react-icons/fa";
import PaginationInfo from "./PaginationInfo";

type modalAddProduct = {
  onClose: (type: string) => void;
  data: pharmacyData | undefined;
  onfetchDataDrugs: () => void;
  drugsPharmacy: IPharmacyDrugByPharmacy[] | undefined;
};

type Input = {
  search: string;
  stock: string;
  price: string;
  searchTimeout?: ReturnType<typeof setTimeout>;
};

const ModalManagerAddDrug = ({
  onClose,
  data,
  onfetchDataDrugs,
  drugsPharmacy,
}: modalAddProduct): React.ReactElement => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataDrugs, setDataDrugs] = useState<IDrugCapital[]>([]);
  const [dataPageDrugs, setDataPageDrugs] = useState<pageInfo>();
  const { setToast } = useContext(ToastContext);
  const [page, setPage] = useState<number>(1);
  const [itemPerPage, setItemPerPage] = useState<string>("20");
  const [addDataDrug, setAddDataDrug] = useState<IDrugCapital>();
  const [didEdit, setDidEdit] = useState({
    stock: false,
    price: false,
  });
  const [input, setInput] = useState<Input>({
    search: "",
    stock: "",
    price: "",
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setDidEdit((prevDidEdit) => ({ ...prevDidEdit, [name]: true }));
    if (input) {
      setInput((prevInput) => ({
        ...prevInput,
        [name]: value,
      }));

      if (name === "search") {
        if (input.searchTimeout) {
          clearTimeout(input.searchTimeout);
        }
        const timeoutId = setTimeout(() => {
          fetchDataDrug();
        }, 1000);
        setInput((prevInput) => ({
          ...prevInput,
          searchTimeout: timeoutId,
        }));
      }
    }
  };

  function handleInputBlur(event: React.ChangeEvent<HTMLInputElement>) {
    const { name } = event.target;
    setDidEdit((prevEdit) => ({
      ...prevEdit,
      [name]: true,
    }));
  }

  const stockIsInvalid = didEdit.stock && input && isNaN(parseInt(input.stock));

  const priceIsInvalid =
    (didEdit.price && input && parseInt(input.price) <= 500) ||
    (input && isNaN(parseInt(input.price)));

  const formIsValid = !stockIsInvalid && !priceIsInvalid;

  const [searchInput, setSearchInput] = useState<string>("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (drugsPharmacy) {
      const url =
        import.meta.env.VITE_DEPLOYMENT_URL + `/managers/pharmacies/drugs`;

      const existingItem = drugsPharmacy.find(
        (item) => item.drug.id === addDataDrug?.Id
      );

      const Index = drugsPharmacy.findIndex(
        (item) => item.drug.id === addDataDrug?.Id
      );

      if (!existingItem) {
        const body = {
          pharmacy_id: data?.id,
          drug_id: addDataDrug?.Id,
          stock: parseInt(input?.stock),
          price: parseInt(input.price),
        };
        setIsLoading(true);
        HandleAddRaw(url, JSON.stringify(body), true)
          .then(() => {
            HandleShowToast(setToast, true, "Add drugs in pharmacy success", 5);
            onClose("add");
            onfetchDataDrugs();
          })
          .catch((error: Error) => {
            HandleShowToast(setToast, false, error.message, 5);
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        const urlEdit = `${
          import.meta.env.VITE_DEPLOYMENT_URL
        }/managers/pharmacies/drugs/${drugsPharmacy[Index].pharmacy_drug_id}`;
        const bodyEdit = {
          stock: parseInt(input?.stock) + drugsPharmacy[Index].stock,
          price: parseInt(input.price),
        };
        setIsLoading(true);
        HandlePatchBodyRaw(JSON.stringify(bodyEdit), urlEdit, true)
          .then(() => {
            HandleShowToast(
              setToast,
              true,
              "Update drugs in pharmacy success",
              5
            );
            onfetchDataDrugs();
            onClose("add");
          })
          .catch((error: Error) => {
            HandleShowToast(setToast, false, error.message, 5);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    }
  };

  const fetchDataDrug = useCallback(() => {
    const url =
      import.meta.env.VITE_DEPLOYMENT_URL +
      `/admin/drugs?search=${searchInput}&page=${page}&limit=${itemPerPage}`;

    setIsLoading(true);
    HandleGet<IDrugAdminResponse>(url, true)
      .then((drug) => {
        setDataDrugs(drug.drugs);
        setDataPageDrugs(drug.page_info);
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 5);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [setToast, page, itemPerPage, searchInput]);

  const handleSetAddDataDrug = (addData: IDrugCapital) => {
    setAddDataDrug(addData);
  };

  useEffect(() => {
    fetchDataDrug();
  }, [fetchDataDrug]);

  return (
    <>
      <div
        onKeyDown={() => {}}
        onClick={() => onClose("add")}
        role="button"
        tabIndex={0}
        className="cursor-default w-[100vw] h-[100vh] fixed top-0 left-0 z-[150] rounded-xl bg-white opacity-75"
      ></div>
      <div className="w-[85vw] h-[auto] fixed z-[150] top-[2vh] left-[50%] translate-x-[-50%] justify-between items-center flex flex-col rounded-xl bg-[#DFF1FD] p-[30px]">
        <div className="flex flex-col min-h-auto h-[auto]  items-center justify-center bg-white p-5 w-[100%] gap-2">
          <div className="flex gap-1 text-gray-600 items-center">
            <input
              className="border-2 my-2 border-gray-700 py-1 px-2 rounded-md text-gray-600"
              type="text"
              value={input?.search}
              name="search"
              placeholder="search product name"
              onChange={handleInputChange}
              onKeyDown={(e) =>
                e.key == "Enter" && setSearchInput(input.search)
              }
            />
          </div>
          <div className="p-6 px-0 overflow-auto h-[55vh] w-full">
            <table className="w-[75vw] min-w-[100%] text-left ">
              <thead>
                <tr>
                  <th className="border-y p-4 w-[40%] f">
                    <p className="block antialiased font-sans text-sm text-blue-gray-900 font-normal leading-none opacity-70">
                      Name
                    </p>
                  </th>
                  <th className="border-y p-4 w-[25%]">
                    <p className="block antialiased font-sans text-sm text-blue-gray-900 font-normal leading-none opacity-70">
                      Category
                    </p>
                  </th>
                  <th className="border-y border-blue-gray-100 flex-1 p-4 w-[30%]">
                    <p className="block antialiased font-sans text-sm text-blue-gray-900 font-normal leading-none opacity-70">
                      Manufacture
                    </p>
                  </th>
                  <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 w-[20%]">
                    <p className="block antialiased font-sans text-sm text-blue-gray-900 font-normal leading-none opacity-70">
                      Availability
                    </p>
                  </th>
                  <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 w-[50%]">
                    <p className="block antialiased font-sans text-sm text-blue-gray-900 font-normal leading-none opacity-70">
                      Selling Unit
                    </p>
                  </th>
                  <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                    <p className="block antialiased font-sans text-sm text-blue-gray-900 font-normal leading-none opacity-70" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading && <p>Loading.....</p>}
                {dataDrugs.map((drug) => (
                  <tr>
                    <td className="p-4 border-b border-blue-gray-50">
                      <div className="flex items-center gap-3">
                        <img
                          src={drug.Image}
                          alt="Spotify"
                          className="inline-block relative object-center w-12 h-12 rounded-lg border border-blue-gray-50 bg-blue-gray-50/50 object-contain p-1"
                        />
                        <p className="block antialiased font-sans text-sm leading-normal text-blue-gray-900 font-bold">
                          {drug.Name}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 border-b border-blue-gray-50">
                      <p className="block antialiased font-sans text-sm leading-normal text-blue-gray-900 font-normal">
                        {drug.Category.Name}
                      </p>
                    </td>
                    <td className="p-4 border-b ">
                      <p className="block antialiased font-sans text-sm leading-normal text-blue-gray-900 font-normal">
                        {drug.Manufacture}
                      </p>
                    </td>
                    <td className="p-4 border-b border-blue-gray-50">
                      <div className="w-max">
                        <div
                          className="relative grid items-center font-sans font-bold uppercase whitespace-nowrap select-none bg-green-500/20 text-green-900 py-1 px-2 text-xs rounded-md"
                          style={{ opacity: 1 }}
                        >
                          <span className="">
                            {drug.isPrescriptionRequired
                              ? "prescription required"
                              : "prescription not required"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 border-b border-blue-gray-50">
                      <div className="flex flex-col w-[10vw] ">
                        <p className="block antialiased font-sans text-sm leading-normal text-blue-gray-900 font-normal capitalize">
                          {drug.UnitInPack}
                          {/* */}
                          {/* */}
                        </p>
                        <p className="block antialiased font-sans text-sm leading-normal text-blue-gray-900 font-normal opacity-70">
                          {drug.Weight} gr
                        </p>
                      </div>
                    </td>
                    <td className="p-4 border-b border-blue-gray-50">
                      <button
                        className={`relative align-middle select-none font-sans font-medium text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none w-10 max-w-[40px] h-10 max-h-[40px] rounded-lg text-xs text-gray-900 hover:bg-gray-900/10 active:bg-gray-900/20`}
                        type="button"
                        onClick={() => {
                          handleSetAddDataDrug(drug);
                        }}
                      >
                        <span className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 p-2 border-2 rounded">
                          <FaPlus />
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationInfo
            stepItemPerPage={10}
            setItemPerPage={(value) => setItemPerPage(value)}
            itemPerPage={parseInt(itemPerPage)}
            minItemPerPage={0}
            maxItemPerPage={100}
            totalPage={dataPageDrugs?.page_count ?? 1}
            activePage={page}
            setPage={(value) => setPage(value)}
            withItemPerPage={false}
          />
          {addDataDrug && (
            <div className="flex flex-row gap-2 items-center w-[100%] justify-start">
              <div className="flex flex-col justify-center h-fit">
                <div className="relative flex flex-col md:flex-row md:space-x-5 space-y-3 md:space-y-0 rounded-xl shadow-lg p-3 max-w-l md:max-w-xl border border-white bg-gray-100">
                  <div className="w-full md:w-1/3 bg-blue grid place-items-center">
                    <img
                      src={addDataDrug?.Image}
                      alt="tailwind logo"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="w-full md:w-2/3 bg-white flex flex-col space-y-2 p-3">
                    <h3 className="font-black text-gray-800 md:text-lg text-lg">
                      {addDataDrug?.Name}
                    </h3>
                    <p className="md:text-sm text-gray-500 text-base line-clamp-3">
                      {addDataDrug?.Description}
                    </p>
                    <p className="text-sm font-black text-gray-800">
                      {addDataDrug?.Manufacture}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 ">
                  <label className="w-[50px]">Stock</label>
                  <input
                    className="border-2 p-2"
                    placeholder="stock"
                    type="text"
                    name="stock"
                    value={input?.stock}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                  />
                </div>
                <div className="flex gap-2">
                  <label className="w-[50px]">Price</label>
                  <input
                    placeholder="Price"
                    type="text"
                    name="price"
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    value={input?.price}
                    className="border-2 p-2"
                  />
                </div>
                <div className="flex gap-2 justify-between">
                  <button
                    onClick={handleSubmit}
                    disabled={!formIsValid}
                    type="submit"
                    className="mr-4 rounded-lg bg-blue-500 py-3 px-6 font-sans text-xs font-bold uppercase text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => onClose("add")}
                    className="mr-4 rounded-lg bg-red-500 py-3 px-6 font-sans text-xs font-bold uppercase text-white shadow-md shadow-red-500/20 transition-all hover:shadow-lg hover:shadow-red-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ModalManagerAddDrug;
