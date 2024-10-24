import React, { useCallback, useContext, useEffect, useState } from "react";
import { pharmacyDataResponse } from "../interfaces/pharmacyManagers";
import { ToastContext } from "../contexts/ToastData";
import { HandleGet } from "../util/API";
import { HandleShowToast } from "../util/ShowToast";

const PharmacyList = (): React.ReactElement => {
  const [dataPharmacy, setDataPharmacy] = useState<pharmacyDataResponse>();
  const { setToast } = useContext(ToastContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expandedAddress, setExpandedAddress] = useState<string | null>(null);

  const fetchDataPharmacy = useCallback(() => {
    
      const url = import.meta.env.VITE_HTTP_BASE_URL +  `/managers/pharmacies`;

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
    }, [setToast]);

  useEffect(() => {
    fetchDataPharmacy();
  }, [fetchDataPharmacy]);

  {
    isLoading && <p>Loading....</p>;
  }

  const toggleExpandAddress = (address: string) => {
    setExpandedAddress((prevAddress) => (prevAddress === address ? null : address));
  };

  return (
    <div className="flex flex-col gap-2 w-[20vw]">
      {dataPharmacy?.pharmacies.map((data) => (
        <div className="flex flex-col bg-gray-300 rounded-lg p-2">
          <h1>{data.pharmacy_name}</h1>
          <div className="flex flex-row gap-2">
            <p>{data.pharmacist_name}</p>
            <p>{data.pharmacist_phone_number}</p>
          </div>
          <div className="flex flex-row gap-2 justify-between">
            <p className="flex flex-col items-start">
            {expandedAddress === data.address
                ? data.address
                : `${data.address.slice(0, 30)}${data.address.length > 30 ? "..." : ""}`}
              {data.address.length > 30 && (
                <button
                  onClick={() => toggleExpandAddress(data.address)}
                  className="text-blue-500 underline focus:outline-none"
                >
                  {expandedAddress === data.address ? "Show Less" : "Show More"}
                </button>
              )}
            </p>
            <p>{data.city}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PharmacyList;
