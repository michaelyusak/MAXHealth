import React, { useCallback, useContext, useEffect, useState } from "react";
import ManagerDrugsTable from "../components/ManagerDrugsTable";
import ManagerPharmaciesTable from "../components/ManagerPharmaciesTable";
import { pageInfo, pharmacyDataResponse } from "../interfaces/pharmacyManagers";
import { HandleGet } from "../util/API";
import { HandleShowToast } from "../util/ShowToast";
import { ToastContext } from "../contexts/ToastData";
import { IDrugPharmacyResponse } from "../interfaces/Drug";

const ManagerDrugsPage = (): React.ReactElement => {
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<number>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataPharmacy, setDataPharmacy] = useState<pharmacyDataResponse>();
  const [pageInfoPharmacy, setPageInfoPharmacy] = useState<pageInfo>();
  const [pagePharmacy, setPagePharmacy] = useState(1);
  const [dataDrugsPharmacy, setDataDrugsPharmacy] =
    useState<IDrugPharmacyResponse>();
  const { setToast } = useContext(ToastContext);
  const [pageDrugs, setPageDrugs] = useState(1);
  const [pageInfoDrug, setPageInfoDrug] = useState<pageInfo>();
  const [pharmacySearch, setPharmacySearch] = useState<string>("");
  const [drugSearch, setDrugSearch] = useState<string>("");

  const fetchDataPharmacy = useCallback(() => {
    const url =
      import.meta.env.VITE_DEPLOYMENT_URL +
      `/managers/pharmacies?search=${pharmacySearch}&page=${pagePharmacy}`;

    setIsLoading(true);
    HandleGet<pharmacyDataResponse>(url, true)
      .then((data) => {
        setDataPharmacy(data);
        setPageInfoPharmacy(data.page_info);
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 5);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [setToast, pagePharmacy, pharmacySearch]);

  const fetchDataDrugsByPharmacyId = useCallback(() => {
    const url =
      import.meta.env.VITE_DEPLOYMENT_URL +
      `/managers/pharmacies/${selectedPharmacyId}/drugs?search=${drugSearch}&page=${pageDrugs}`;

    setIsLoading(true);
    HandleGet<IDrugPharmacyResponse>(url, true)
      .then((data) => {
        setDataDrugsPharmacy(data);
        setPageInfoDrug(data.page_info);
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 5);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [setToast, selectedPharmacyId, pageDrugs, drugSearch]);

  const handleSetPage = (currentPage: number) => {
    setPagePharmacy(currentPage);
  };

  const handleSetSearchPharmacy = (search: string) => {
    setPharmacySearch(search);
  };

  const handleSetSearchDrug = (search: string) => {
    setDrugSearch(search);
  };

  const handleSetDrugsPage = (currentPage: number) => {
    setPageDrugs(currentPage);
  };

  useEffect(() => {
    fetchDataPharmacy();
    if (selectedPharmacyId) {
      fetchDataDrugsByPharmacyId();
    }
  }, [
    fetchDataPharmacy,
    fetchDataDrugsByPharmacyId,
    selectedPharmacyId,
    pagePharmacy,
  ]);

  function handleSetSelectedPharmacyId(id: number) {
    const drugsTable = document.getElementById("manager-drugs-table");
    drugsTable?.scrollTo(0, 0);

    setSelectedPharmacyId(id);
  }

  {
    isLoading && <h1>Loading Data....</h1>;
  }

  return (
    <div className="w-[100%] flex flex-col gap-[20px]">
      <div className="w-[100%] flex justify-between">
        <ManagerPharmaciesTable
          drugsPharmacy={dataDrugsPharmacy?.drugs}
          onSearchPharmacy={(searchPharmacy) => {
            handleSetSearchPharmacy(searchPharmacy);
            setPagePharmacy(1);
          }}
          onfetchDataDrugs={fetchDataDrugsByPharmacyId}
          pageInfo={pageInfoPharmacy}
          setPagePharmacy={handleSetPage}
          selectedPharmacy={selectedPharmacyId}
          pharmacyData={dataPharmacy}
          onSetPharmacyId={(pharmacyId) => {
            setPageDrugs(1);
            handleSetSelectedPharmacyId(pharmacyId);
          }}
        ></ManagerPharmaciesTable>
        {selectedPharmacyId && (
          <ManagerDrugsTable
            onSearchDrug={(searchDrug) => {
              handleSetSearchDrug(searchDrug);
              setPageDrugs(1);
            }}
            onfetchDataDrugs={fetchDataDrugsByPharmacyId}
            drugs={dataDrugsPharmacy?.drugs}
            pageInfo={pageInfoDrug}
            setPagePharmacy={handleSetDrugsPage}
          ></ManagerDrugsTable>
        )}
      </div>
    </div>
  );
};

export default ManagerDrugsPage;
