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
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";
import { useNavigate } from "react-router-dom";
import { ToastContext } from "../contexts/ToastData";
import { HandleShowToast } from "../util/ShowToast";
import {
  pharmacyDataResponse,
  pharmacyManagers,
} from "../interfaces/pharmacyManagers";
import { FormatDateToYMDDashed } from "../util/DateFormatter";

const AdminReportPage = (): React.ReactElement => {
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
    partnerId: number;
    pharmacyId: number;
    pharmacyName: string;
    month: number;
    sort: string;
  }>({
    partnerId: 0,
    pharmacyId: 0,
    pharmacyName: "",
    month: 0,
    sort: "",
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

  const [partners, setPartners] = useState<pharmacyManagers>();
  const [pharmacies, setPharmacies] = useState<pharmacyDataResponse>();
  const [pharmacyDrugCategoryReport, setPharmacyDrugCategoryReport] =
    useState<IPharmacyDrugCategoryReport[]>();
  const [pharmacyDrugReport, setPharmacyDrugReport] =
    useState<IPharmacyDrugReport[]>();

  const getPharmacyDrugCategoryReport = useCallback(() => {
    if (selectedFilter.pharmacyId > 0) {
      const url =
        import.meta.env.VITE_HTTP_BASE_URL +
        `/admin/categories/reports?${
          selectedFilter.pharmacyId > 0
            ? `pharmacy_id=${selectedFilter.pharmacyId}`
            : ""
        }${
          monthFilterOptions()[selectedFilter.month].minDate !== ""
            ? `&min_date=${monthFilterOptions()[selectedFilter.month].minDate}`
            : ""
        }${
          monthFilterOptions()[selectedFilter.month].maxDate !== ""
            ? `&max_date=${monthFilterOptions()[selectedFilter.month].maxDate}`
            : ""
        }${selectedFilter.sort !== "" ? `&sort=${selectedFilter.sort}` : ""}`;

      HandleGet<{ report: IPharmacyDrugCategoryReport[] }>(url, true)
        .then((responseData) => {
          setPharmacyDrugCategoryReport(responseData.report);
        })
        .catch((error: Error) => {
          if (error.message == MsgRefreshTokenNotFound) {
            navigate("/auth/login");
          }
          HandleShowToast(setToast, false, error.message, 5);
        });
    }
  }, [
    selectedFilter.pharmacyId,
    selectedFilter.month,
    selectedFilter.sort,
    monthFilterOptions,
    navigate,
    setToast,
  ]);

  const getPharmacyDrugReport = useCallback(() => {
    if (selectedFilter.pharmacyId > 0) {
      const url =
        import.meta.env.VITE_HTTP_BASE_URL +
        `/admin/drugs/reports?${
          selectedFilter.pharmacyId > 0
            ? `pharmacy_id=${selectedFilter.pharmacyId}`
            : ""
        }${
          monthFilterOptions()[selectedFilter.month].minDate !== ""
            ? `&min_date=${monthFilterOptions()[selectedFilter.month].minDate}`
            : ""
        }${
          monthFilterOptions()[selectedFilter.month].maxDate !== ""
            ? `&max_date=${monthFilterOptions()[selectedFilter.month].maxDate}`
            : ""
        }${selectedFilter.sort !== "" ? `&sort=${selectedFilter.sort}` : ""}`;
      HandleGet<{ report: IPharmacyDrugReport[] }>(url, true)
        .then((responseData) => {
          setPharmacyDrugReport(responseData.report);
        })
        .catch((error: Error) => {
          if (error.message == MsgRefreshTokenNotFound) {
            navigate("/auth/login");
          }
          HandleShowToast(setToast, false, error.message, 5);
        });
    }
  }, [
    selectedFilter.pharmacyId,
    selectedFilter.month,
    selectedFilter.sort,
    monthFilterOptions,
    navigate,
    setToast,
  ]);

  const getPartners = useCallback(() => {
    const url = import.meta.env.VITE_HTTP_BASE_URL + "/partners";
    HandleGet<pharmacyManagers>(url, true)
      .then((responseData) => {
        setPartners(responseData);
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 5);
      });
  }, [setToast]);

  useEffect(() => {
    getPartners();
  }, [getPartners]);

  useEffect(() => {
    getPharmacyDrugCategoryReport();
    getPharmacyDrugReport();
  }, [getPharmacyDrugCategoryReport, getPharmacyDrugReport]);

  const handlePharmacySearch = () => {
    if (selectedFilter.partnerId > 0) {
      const url =
        import.meta.env.VITE_HTTP_BASE_URL +
        `/admin/manager/${selectedFilter.partnerId}/pharmacies?search=${selectedFilter.pharmacyName}&limit=20`;

      HandleGet<pharmacyDataResponse>(url, true)
        .then((data) => {
          setPharmacies(data);
        })
        .catch((error: Error) => {
          HandleShowToast(setToast, false, error.message, 5);
        });
    }
  };

  return (
    <div className="w-[100%] min-h-[calc(100vh-180px)] flex flex-col gap-[2rem]">
      <select
        className={`w-full border-[1px] bg-white outline-none text-[#000D44] rounded-[30px] px-[1.25rem] py-[1rem] cursor-pointer`}
        value={selectedFilter.partnerId}
        onChange={(e) => handleFilterChange("partnerId", e.target.value)}
      >
        <option
          value=""
          disabled={selectedFilter.partnerId > 0}
          className="cursor-pointer"
        >
          Partner
        </option>
        {partners &&
          partners.partners.length > 0 &&
          partners.partners.map((partner, i) => (
            <option key={i} value={partner.id} className="cursor-pointer">
              {partner.name}
            </option>
          ))}
      </select>
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
      <select
        className={`w-full border-[1px] bg-white outline-none text-[#000D44] rounded-[30px] px-[1.25rem] py-[1rem] cursor-pointer`}
        value={selectedFilter.sort}
        onChange={(e) => handleFilterChange("sort", e.target.value)}
      >
        <option value="" disabled className="cursor-pointer">
          Sort by Sales Volume
        </option>
        <option value="asc" className="cursor-pointer">
          Ascending
        </option>
        <option value="desc" className="cursor-pointer">
          Descending
        </option>
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

export default AdminReportPage;
