import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { HandleGet } from "../util/API";
import {
  ManagerPharmacyDrugCatagoryReportUrl,
  ManagerPharmacyDrugReportUrl,
} from "../util/URL";
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";
import { useNavigate } from "react-router-dom";
import { ToastContext } from "../contexts/ToastData";
import { HandleShowToast } from "../util/ShowToast";
import { pharmacyDataResponse } from "../interfaces/pharmacyManagers";
import { FormatDateToYMDDashed } from "../util/DateFormatter";

const ManagerReportPage = (): React.ReactElement => {
  const navigate = useNavigate();
  const { setToast } = useContext(ToastContext);

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

  const months = useMemo(
    () => [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    []
  );

  const monthFilterOptions = useCallback(() => {
    const monthFilterOpts: {
      month: string;
      year: number;
      maxDate: string;
      minDate: string;
    }[] = [];
    for (let i = 0; i < 12; i++) {
      const now = new Date();

      const firstDay = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const month = months[firstDay.getMonth()];
      const year = firstDay.getFullYear();
      monthFilterOpts.push({
        month: month,
        year: year,
        maxDate: FormatDateToYMDDashed(lastDay),
        minDate: FormatDateToYMDDashed(firstDay),
      });
    }
    return monthFilterOpts;
  }, [months]);

  monthFilterOptions();

  const drugCategoryReportOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `Top 5 Drug Category Sales Revenue - ${
          months[new Date().getMonth()]
        } ${new Date().getFullYear()}`,
      },
      legend: {
        display: false,
      },
    },
  };

  const drugReportOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `Top 5 Drug Sales Revenue - ${
          months[new Date().getMonth()]
        } ${new Date().getFullYear()}`,
      },
      legend: {
        display: false,
      },
    },
  };

  const [selectedFilter, setSelectedFilter] = useState<{
    pharmacyId: number;
    month: number;
    pharmacyName: string;
  }>({
    pharmacyId: 0,
    month: 0,
    pharmacyName: "",
  });

  const handleFilterChange = (key: string, value: number | string) => {
    setSelectedFilter((prev) => {
      const updatedValue = {
        ...prev,
        [key]: value,
      };

      return updatedValue;
    });
  };

  interface IPharmacyDrugCategoryReport {
    drug_category_id: number;
    drug_category_name: string;
    sales_volume: number;
    revenue: number;
  }

  interface IPharmacyDrugReport {
    drug_id: number;
    drug_name: string;
    sales_volume: number;
    revenue: number;
  }

  const [pharmacies, setPharmacies] = useState<pharmacyDataResponse>();
  const [pharmacyDrugCategoryReport, setPharmacyDrugCategoryReport] =
    useState<IPharmacyDrugCategoryReport[]>();
  const [pharmacyDrugReport, setPharmacyDrugReport] =
    useState<IPharmacyDrugReport[]>();

  const getPharmacyDrugCategoryReport = useCallback(() => {
    if (selectedFilter.pharmacyId > 0)
      HandleGet<{ report: IPharmacyDrugCategoryReport[] }>(
        ManagerPharmacyDrugCatagoryReportUrl(
          selectedFilter.pharmacyId,
          monthFilterOptions()[selectedFilter.month].maxDate,
          monthFilterOptions()[selectedFilter.month].minDate
        ),
        true
      )
        .then((responseData) => {
          setPharmacyDrugCategoryReport(responseData.report);
        })
        .catch((error: Error) => {
          if (error.message == MsgRefreshTokenNotFound) {
            navigate("/auth/login");
          }
          HandleShowToast(setToast, false, error.message, 5);
        });
  }, [
    selectedFilter.pharmacyId,
    selectedFilter.month,
    monthFilterOptions,
    navigate,
    setToast,
  ]);

  const getPharmacyDrugReport = useCallback(() => {
    if (selectedFilter.pharmacyId > 0)
      HandleGet<{ report: IPharmacyDrugReport[] }>(
        ManagerPharmacyDrugReportUrl(
          selectedFilter.pharmacyId,
          monthFilterOptions()[selectedFilter.month].maxDate,
          monthFilterOptions()[selectedFilter.month].minDate
        ),
        true
      )
        .then((responseData) => {
          setPharmacyDrugReport(responseData.report);
        })
        .catch((error: Error) => {
          if (error.message == MsgRefreshTokenNotFound) {
            navigate("/auth/login");
          }
          HandleShowToast(setToast, false, error.message, 5);
        });
  }, [
    selectedFilter.pharmacyId,
    selectedFilter.month,
    monthFilterOptions,
    navigate,
    setToast,
  ]);

  const handlePharmacySearch = () => {
    const url =
      import.meta.env.VITE_DEPLOYMENT_URL +
      `/managers/pharmacies?search=${selectedFilter.pharmacyName}&limit=1000000`;
    HandleGet<pharmacyDataResponse>(url, true)
      .then((responseData) => {
        setPharmacies(responseData);
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 5);
      });
  };

  useEffect(() => {
    getPharmacyDrugCategoryReport();
    getPharmacyDrugReport();
  }, [getPharmacyDrugCategoryReport, getPharmacyDrugReport]);

  return (
    <div className="w-[100%] min-h-[calc(100vh-180px)] flex flex-col gap-[2rem]">
      <input
        type="text"
        placeholder="Pharmacy Name"
        className="w-full border-[1px] bg-white outline-none text-[#000D44] rounded-[30px] px-[1.25rem] py-[1rem] cursor-pointer"
        value={selectedFilter.pharmacyName}
        onChange={(e) => handleFilterChange("pharmacyName", e.target.value)}
        onKeyDown={(e) => e.key == "Enter" && handlePharmacySearch()}
      ></input>
      {selectedFilter.pharmacyName === "" &&
      (!pharmacies || pharmacies?.pharmacies.length === 0) ? (
        <p>Search Pharmacy First</p>
      ) : pharmacies?.pharmacies.length === 0 ? (
        <p>Pharmacy Not Found</p>
      ) : (
        <></>
      )}
      <select
        className={`w-full border-[1px] bg-white outline-none text-[#000D44] rounded-[30px] px-[1.25rem] py-[1rem] cursor-pointer`}
        value={selectedFilter.pharmacyId}
        onChange={(e) => handleFilterChange("pharmacyId", e.target.value)}
        disabled={!pharmacies || pharmacies?.pharmacies.length === 0}
      >
        <option
          value=""
          disabled={selectedFilter.pharmacyId > 0}
          className="cursor-pointer"
        >
          Pharmacy
        </option>
        {pharmacies &&
          pharmacies?.pharmacies.length > 0 &&
          pharmacies.pharmacies.map((pharmacy, i) => (
            <option key={i} value={pharmacy.id} className="cursor-pointer">
              {pharmacy.pharmacy_name}
            </option>
          ))}
      </select>
      <select
        className={`w-full border-[1px] bg-white outline-none text-[#000D44] rounded-[30px] px-[1.25rem] py-[1rem] cursor-pointer`}
        value={selectedFilter.month}
        onChange={(e) => handleFilterChange("month", e.target.value)}
      >
        <option value="" disabled className="cursor-pointer">
          Month
        </option>
        {monthFilterOptions().map((opt, i) => (
          <option key={i} value={i} className="cursor-pointer">
            {opt.month} {opt.year}
          </option>
        ))}
      </select>
      <div className="flex flex-row gap-[2rem]">
        <div
          className={`flex flex-col gap-[20px] w-[50%] ${
            pharmacyDrugCategoryReport && pharmacyDrugCategoryReport.length > 0
              ? ""
              : "justify-center items-center"
          } min-h-[60vh]`}
        >
          {pharmacyDrugCategoryReport &&
          pharmacyDrugCategoryReport.length > 0 ? (
            <>
              <Bar
                options={drugCategoryReportOptions}
                data={{
                  labels: pharmacyDrugCategoryReport
                    .slice(0, 5)
                    .map(
                      (report) => `${report.drug_category_name.slice(0, 18)}...`
                    ),
                  datasets: [
                    {
                      label: "Revenue (Rp)",
                      data: pharmacyDrugCategoryReport
                        .slice(0, 5)
                        .map((report) => report.revenue),
                      backgroundColor: ["#1F5FFF"],
                    },
                  ],
                }}
              />
              <div className="bg-white rounded-[8px] p-[10px]">
                <table className="w-full">
                  <thead className="text-[18px] font-bold capitalize">
                    <tr className="border-b-[1px]">
                      <th className="p-2">Category ID</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Sales Volume</th>
                      <th className="p-2">Revenue (Rp)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pharmacyDrugCategoryReport?.map((categoryReport) => (
                      <tr>
                        <td className="p-2 text-start">
                          <p>{categoryReport.drug_category_id}</p>
                        </td>
                        <td className="p-2 text-start">
                          <p>{categoryReport.drug_category_name}</p>
                        </td>
                        <td className="p-2 text-start">
                          <p>{categoryReport.sales_volume}</p>
                        </td>
                        <td className="p-2 text-start">
                          <p>{categoryReport.revenue}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p>No Reports</p>
          )}
        </div>
        <div
          className={`flex flex-col gap-[20px] w-[50%] ${
            pharmacyDrugReport && pharmacyDrugReport.length > 0
              ? ""
              : "justify-center items-center"
          } min-h-[60vh]`}
        >
          {pharmacyDrugReport && pharmacyDrugReport.length > 0 ? (
            <>
              <Bar
                options={drugReportOptions}
                data={{
                  labels: pharmacyDrugReport
                    .slice(0, 5)
                    .map((report) => `${report.drug_name.slice(0, 18)}...`),
                  datasets: [
                    {
                      label: "Revenue (Rp)",
                      data: pharmacyDrugReport
                        .slice(0, 5)
                        .map((report) => report.revenue),
                      backgroundColor: ["#1F5FFF"],
                    },
                  ],
                }}
              />
              <div className="bg-white rounded-[8px] p-[10px]">
                <table className="w-full">
                  <thead className="text-[18px] font-bold capitalize">
                    <tr className="border-b-[1px]">
                      <th className="p-2">Drug ID</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Sales Volume</th>
                      <th className="p-2">Revenue (Rp)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pharmacyDrugReport?.map((drugReport) => (
                      <tr>
                        <td className="p-2 text-start">
                          <p>{drugReport.drug_id}</p>
                        </td>
                        <td className="p-2 text-start">
                          <p>{drugReport.drug_name}</p>
                        </td>
                        <td className="p-2 text-start">
                          <p>{drugReport.sales_volume}</p>
                        </td>
                        <td className="p-2 text-start">
                          <p>{drugReport.revenue}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p>No Reports</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerReportPage;
