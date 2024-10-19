import React, { useContext, useEffect, useState } from "react";
import { IPrescriptionListResponse } from "../interfaces/Prescription";
import { FormatTimeFull } from "../util/DateFormatter";
import { HandleGet } from "../util/API";
import { useNavigate } from "react-router-dom";
import { HandleShowToast } from "../util/ShowToast";
import { ToastContext } from "../contexts/ToastData";

const PrescriptionListPage = (): React.ReactElement => {
  const navigate = useNavigate();
  const { setToast } = useContext(ToastContext);

  useEffect(() => {
    const url = import.meta.env.VITE_HTTP_BASE_URL + "/prescriptions";
    HandleGet<IPrescriptionListResponse>(url, true)
      .then((responseData) => {
        setPrescriptions(responseData);
      })
      .catch((error: Error) => {
        HandleShowToast(
          setToast,
          false,
          `Failed to fetch prescription list, ${error.message}`,
          5
        );
      });
  }, [setToast]);

  const [prescriptions, setPrescriptions] =
    useState<IPrescriptionListResponse>();

  return (
    <>
      <div className="flex flex-col min-h-[83vh] gap-[20px] p-3 md:p-0">
        <h1 className="text-[30px] font-[800]">My Prescriptions</h1>
        {prescriptions &&
          prescriptions.prescriptions &&
          prescriptions.prescriptions.map((prescription) => (
            <div className="w-[100%] p-[20px] rounded-2xl border-2 md:border-slate-400 border-slate-400/50 flex flex-col gap-[10px] ">
              <div className="w-[100%] flex justify-between">
                <p className="text-[14px] md:text-[18px] font-[500] text-gray-500 ">
                  Prescripted by: {prescription.doctor_name}
                </p>
                <p className="text-[14px] md:text-[18px] font-[500]">
                  {FormatTimeFull(prescription.created_at)}
                </p>
              </div>
              {prescription.prescription_drugs.map((drug) => (
                <div className="p-[5px] border-2 md:border-slate-400 w-[100%] border-slate-400/50 rounded-xl flex items-center justify-between gap-2 md:gap-0">
                  <img
                    className="w-[100px] md:w-[200px] border-[1px] md:border-slate-600 border-slate-400/50 object-cover aspect-square rounded-xl"
                    alt=""
                    src={drug.drug.image}
                  ></img>
                  <p className="text-sm md:w-[35%] line-clamp-3 text-center md:text-[18px] font-[500]">
                    {drug.drug.name}
                  </p>
                  <p className="text-sm md:w-[7%] line-clamp-3 text-center md:text-[18px] font-[500]">
                    {drug.quantity}
                  </p>
                  <p className="text-sm md:w-[20%] line-clamp-3 text-center md:text-[18px] font-[500]">
                    {drug.note == "" ? "-" : drug.note}
                  </p>
                </div>
              ))}
              {prescription.ordered_at ? (
                <div className="ml-auto px-[20px] py-[10px] text-[18px] font-[600] rounded-xl text-white bg-[#14c57b] cursor-not-allowed">
                  Ordered at {FormatTimeFull(prescription.ordered_at)}
                </div>
              ) : (
                <button
                  onClick={() =>
                    navigate(
                      `/prescriptions/checkout/${prescription.id}`
                    )
                  }
                  className="text-[16px] ml-auto px-[20px] py-[10px] md:text-[18px] font-[600] rounded-xl text-white bg-[#14c57b]"
                >
                  Checkout
                </button>
              )}
            </div>
          ))}
      </div>
    </>
  );
};

export default PrescriptionListPage;
