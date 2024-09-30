import React, { useContext } from "react";
import { IPrescriptionDrug } from "../interfaces/Telemedicine";
import { useNavigate } from "react-router-dom";
import { HandlePatchBodyRaw } from "../util/API";
import { HandleShowToast } from "../util/ShowToast";
import { ToastContext } from "../contexts/ToastData";

type prescriptionModalProps = {
  isUser?: boolean;
  prescriptionId: number;
  prescriptedDrugs: IPrescriptionDrug[];
  handleClose: () => void;
};

const PrescriptionModal = ({
  prescriptionId,
  isUser,
  prescriptedDrugs,
  handleClose,
}: prescriptionModalProps): React.ReactElement => {
  const navigate = useNavigate();
  const { setToast } = useContext(ToastContext);

  function handleSavePrescription() {
    const url =
      import.meta.env.VITE_DEPLOYMENT_URL + `/prescriptions/${prescriptionId}`;

    HandlePatchBodyRaw("", url, true)
      .then(() => {
        navigate("/prescriptions/");
        HandleShowToast(setToast, true, "Successfully Saved Prescriptions", 5);
        handleClose();
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 5);
      });
  }

  return (
    <div>
      <div className="bg-black opacity-50 w-[100vw] h-[100vh] top-0 left-0 absolute z-[20]"></div>
      <div className="h-[90%] w-[50%] p-[50px] bg-white absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-[21] rounded-2xl">
        <div className=" border-2 border-gray-600 flex flex-col justify-between w-full h-full rounded-2xl p-1">
          <div
            className="h-[700px] p-[10px] rounded-xl overflow-y-auto bg-gray-400 flex flex-col gap-[5px]"
            style={{ scrollbarWidth: "none" }}
          >
            {prescriptedDrugs?.map((drug) => (
              <div className="p-[10px] gap-[20px] flex bg-white rounded-xl border-2 border-gray-800">
                <img
                  alt=""
                  src={drug.drug.image}
                  className="h-[200px] aspect-square rounded-xl"
                ></img>
                <div>
                  <p className="line-clamp-3 text-[20px] font-[600]">
                    {drug.drug.name}
                  </p>
                  <p className="text-[18px]">Quantity: {drug.quantity}</p>
                  <p className="text-[18px]">Note: {drug.note}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-[10px] ml-auto">
            <button
              onClick={() => handleClose()}
              className="px-[20px] py-[5px] text-[18px] font-[600] bg-[#FF0000] rounded-[8px] text-white"
            >
              Close
            </button>

            {isUser && (
              <>
                <button
                  onClick={() => {
                    handleSavePrescription();
                  }}
                  className="px-[20px] py-[5px] text-[18px] font-[600] bg-[#14C57B] rounded-[8px] text-white"
                >
                  Save
                </button>
                <button
                  onClick={() =>
                    navigate(
                      `/prescriptions/checkout/${prescriptionId}`
                    )
                  }
                  className="px-[20px] py-[5px] text-[18px] font-[600] bg-[#1F5FFF] rounded-[8px] text-white"
                >
                  Checkout Now
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionModal;
