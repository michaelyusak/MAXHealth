import React, { useCallback, useContext, useEffect, useState } from "react";
import { HandleGet } from "../util/API";
import { IStockMutation } from "../interfaces/StockMutation";
import { ToastContext } from "../contexts/ToastData";
import { HandleShowToast } from "../util/ShowToast";
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";
import { useNavigate } from "react-router-dom";
import { FaMinus, FaPlus } from "react-icons/fa";
import { IoSearchSharp } from "react-icons/io5";
import {
  pharmacyData,
  pharmacyDataResponse,
} from "../interfaces/pharmacyManagers";

const ManagerStockChangesPage = (): React.ReactElement => {
  const { setToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const [stockMutationList, setStockMutationList] = useState<IStockMutation[]>(
    []
  );

  const [selectedPharmacyId, setSelectedPharmacyId] = useState<number>();

  useEffect(() => {
    const url =
      import.meta.env.VITE_HTTP_BASE_URL +
      `/managers/stock-change?${
        selectedPharmacyId ? `pharmacy-id=${selectedPharmacyId}` : ""
      }`;

    const tableBody = document.getElementById("table-body-scrollable");

    HandleGet<IStockMutation[]>(url, true)
      .then((responseData) => {
        setStockMutationList(responseData);
        tableBody?.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      })
      .catch((error: Error) => {
        if (error.message == MsgRefreshTokenNotFound) {
          navigate("/");
          HandleShowToast(setToast, false, error.message, 7, true);
        }

        HandleShowToast(setToast, false, error.message, 5);
      });
  }, [setToast, navigate, selectedPharmacyId]);

  const [searchInput, setSearchInput] = useState<string>("");
  const [searchParam, setSearchParam] = useState<string>();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pharmacyList, setPharmacyList] = useState<pharmacyData[]>([]);

  const fetchDataPharmacy = useCallback(() => {
    const url =
      import.meta.env.VITE_HTTP_BASE_URL +
      `/managers/pharmacies?${
        searchParam ? `search=${searchParam}&` : ""
      }page=1&limit=20`;

    setIsLoading(true);
    HandleGet<pharmacyDataResponse>(url, true)
      .then((data) => {
        setPharmacyList(data.pharmacies);
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 5);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [setToast, searchParam]);

  useEffect(() => {
    fetchDataPharmacy();
  }, [fetchDataPharmacy]);

  return (
    <>
      {isLoading && (
        <div className="w-[100vw] h-[100vh] bg-black absolute top-0 left-0 z-[50] opacity-50"></div>
      )}
      <div className="w-full h-[80vh] flex flex-col gap-[20px] p-[10px] border-slate-400 rounded-xl border-2">
        <div className="w-full flex justify-between items-center px-[10px]">
          <h1 className="text-[24px] font-[600]">Stock Mutation</h1>
          <div className="w-[500px] h-[50px] relative border-2 border-slate-600 rounded-xl px-[10px] py-[5px] flex justify-between items-center">
            <input
              className="w-full text-[18px] h-full outline-none"
              placeholder="Search pharmacy name..."
              type="text"
              value={searchInput}
              onChange={(e) => {
                if (e.target.value == "") {
                  setSelectedPharmacyId(undefined);
                  setPharmacyList([]);
                }
                setSearchInput(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  searchInput == ""
                    ? setSearchParam(undefined)
                    : setSearchParam(searchInput);
                }
              }}
            ></input>
            <button
              onClick={() =>
                searchInput == ""
                  ? setSearchParam(undefined)
                  : setSearchParam(searchInput)
              }
              className="p-[5px] bg-transparent"
            >
              <IoSearchSharp className="text-[20px]" />
            </button>
            {pharmacyList.length > 0 && (
              <div
                className="absolute w-full flex flex-col gap-[10px] top-[55px] bg-white max-h-[300px] overflow-y-auto"
                style={{ scrollbarWidth: "thin" }}
              >
                {pharmacyList.map((pharmacy) => (
                  <button
                    onClick={() => {
                      setSelectedPharmacyId(pharmacy.id);
                      setSearchInput(pharmacy.pharmacy_name);
                      setPharmacyList([]);
                    }}
                    className="w-full py-[5px] px-[10px]"
                  >
                    <p className="truncate">{pharmacy.pharmacy_name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="w-full p-[5px] rounded-[8px] border-[1px] border-slate-400">
          <div>
            <table className="max-h-[100%] w-[calc(100%-15px)] border-b-4 border-gray-400">
              <thead>
                <tr className="text-[18px] h-[40px] font-[600]">
                  <th className="w-[3%]">No.</th>
                  <th className="w-[20%]">Pharmacy</th>
                  <th className="w-[37%]">Drug</th>
                  <th className="w-[10%]">Changes</th>
                  <th className="w-[10%]">Final Count</th>
                  <th className="w-[20%]">Description</th>
                </tr>
              </thead>
            </table>
          </div>
          <div
            id="table-body-scrollable"
            className="overflow-y-auto h-[620px]"
            style={{ scrollbarWidth: "thin" }}
          >
            <table className="w-[calc(100%-5px)]">
              <tbody className="overflow-y-auto">
                {stockMutationList.map((item, i) => (
                  <tr className="h-[200px] border-b-[1px] border-slate-600">
                    <th className="w-[3%] border-r-[1px] border-gray-700">
                      {i + 1}
                    </th>
                    <th className="w-[20%]">
                      <div className="w-full h-full flex flex-col gap-[10px] px-[10px]">
                        <p className="h-[50px] line-clamp-2 break-words break-all">
                          {item.pharmacy_name}
                        </p>
                        <p className="h-[75px] line-clamp-3 break-words break-all">
                          {item.pharmacy_address}
                        </p>
                      </div>
                    </th>
                    <th className="w-[37%]">
                      <div className="w-full h-full flex px-[10px] items-center gap-[20px]">
                        <img
                          alt=""
                          src={item.drug_url}
                          className="w-[140px] aspect-square object-cover shadow-2xl"
                        ></img>
                        <p className="h-[100px] line-clamp-4 break-all break-words">
                          {item.drug_name}
                        </p>
                      </div>
                    </th>
                    <th
                      className={`w-[10%] px-[10px] ${
                        item.stock_change >= 0
                          ? "text-[#1F5FFD]"
                          : "text-[#ff0000]"
                      }`}
                    >
                      <div className="flex gap-[5px] items-center justify-center">
                        {item.stock_change > 0 ? (
                          <FaPlus className="text-[16px]" />
                        ) : (
                          <FaMinus className="text-[16px]" />
                        )}
                        <p className="text-[18px] w-[calc(100%-20px)] font-[600] line-clamp-5 break-all break-words">
                          {item.stock_change.toString().replace("-", "")}
                        </p>
                      </div>
                    </th>
                    <th className="w-[10%] px-[10px] text-[20px] text-[#04CE78] font-[600]">
                      <p className="line-clamp-5">{item.final_stock}</p>
                    </th>
                    <th className="w-[20%]">
                      <p className="line-clamp-5 break-all break-words w-full h-full text-[16px]">
                        {item.description}
                      </p>
                    </th>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManagerStockChangesPage;
