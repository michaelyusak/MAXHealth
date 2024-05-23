import React, { useCallback, useContext, useEffect, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { HandleAddRaw, HandleGet } from "../util/API";
import { IPossibleMutation } from "../interfaces/Pharmacy";
import { IPharmacyDrugByPharmacy } from "../interfaces/Drug";
import { HandleShowToast } from "../util/ShowToast";
import { ToastContext } from "../contexts/ToastData";

type managerRequestStockProps = {
  onClose: () => void;
  onConfirm: () => void;
  drug: IPharmacyDrugByPharmacy;
};

const ManagerRequestStock = ({
  onClose,
  onConfirm,
  drug,
}: managerRequestStockProps): React.ReactElement => {
  const { setToast } = useContext(ToastContext);
  const [allPossibleMutation, setAllPossibleMutation] = useState<
    IPossibleMutation[]
  >([]);

  const fetchAllPossibleMutation = useCallback(() => {
    if (drug && drug.pharmacy_drug_id) {
      const url = import.meta.env.VITE_DEPLOYMENT_URL + `/managers/pharmacies/drugs/${drug.pharmacy_drug_id}/mutation`;

      setIsLoading(true);
      HandleGet<IPossibleMutation[]>(url, true)
        .then((responseData) => {
          setAllPossibleMutation(responseData);

          const val: {
            [key: number]: { status: "listing" | "requesting" };
          } = {};
          responseData.forEach((possibleMutation) => {
            val[possibleMutation.pharmacy_drug_id] = { status: "listing" };
          });
          setStatus(val);
        })
        .catch((error: Error) => {
          HandleShowToast(
            setToast,
            false,
            `Failed to fetch possible stock mutation, ${error.message}`,
            5
          );
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [drug, setToast]);

  useEffect(() => {
    fetchAllPossibleMutation();
  }, [fetchAllPossibleMutation]);

  function handlePostMutation(senderPharmacyDrugId: number, quantity: number) {
    const url = import.meta.env.VITE_DEPLOYMENT_URL + `/managers/pharmacies/drugs/${drug.pharmacy_drug_id}/mutation`;

    const body = {
      sender_pharmacy_drug_id: senderPharmacyDrugId,
      quantity: quantity,
    };

    setIsLoading(true);
    HandleAddRaw(url, JSON.stringify(body), true)
      .then(() => {
        HandleShowToast(setToast, true, "Stock request created", 5);
        fetchAllPossibleMutation();
        onConfirm();
        drug.stock += quantity;
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 5);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  const [itemQuantities, setItemQuantities] = useState<{
    [key: number]: { quantity: number };
  }>();

  const [status, setStatus] = useState<{
    [key: number]: { status: "listing" | "requesting" };
  }>({});

  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <div className="absolute z-40 top-0 left-0 h-[100vh] w-[100vw]">
      <div
        onClick={() => onClose()}
        className="w-[100%] h-full bg-black bg-opacity-[0.6]"
      ></div>

      {isLoading && (
        <div className="w-[75%] h-[80%] absolute z-[60] top-[50%] left-[50%] translate-x-[-50%] rounded-xl translate-y-[-50%] bg-gray-400 opacity-[0.75] animate-pulse"></div>
      )}

      <div className="w-[75%] p-[50px] absolute z-40 h-[80%] flex flex-col gap-[20px] translate-x-[-50%] translate-y-[-50%] bg-white rounded-xl opacity-100 top-[50%] left-[50%] bg-opacity-100">
        <div className="flex justify-between">
          <h1 className="text-[28px] font-[600]">Request Stock</h1>
          <button onClick={() => onClose()} className="p-[5px]">
            <MdClose className="text-[28px]" />
          </button>
        </div>
        <div className="flex w-[60%] mx-auto justify-between">
          <img
            alt=""
            src={drug.drug.image}
            className="w-[250px] aspect-square object-cover"
          ></img>
          <div className="w-[60%] flex flex-col gap-[10px]">
            <h2 className="line-clamp-3 text-[20px] font-[600] h-[75px]">
              {drug.drug.name}
            </h2>
            <p className="text-[18px] font-[600]">{drug.drug.manufacture}</p>
            <div className="flex mt-auto py-[5px] gap-[10px]">
              <p className="text-[16px] font-[500]">Current Stock</p>
              <p className="text-[16px] font-[600]">{drug.stock}</p>
            </div>
          </div>
        </div>
        <div
          className="overflow-y-auto grid gap-[10px] p-[10px] grid-cols-[repeat(auto-fill,_minmax(400px,_1fr))] place-items-start justify-content-start"
          style={{ scrollbarWidth: "thin" }}
        >
          {allPossibleMutation &&
            allPossibleMutation.map((possibleMutation) => (
              <div className="w-[400px] bg-gray-200 p-[10px] flex flex-col gap-[5px] rounded-2xl h-[150px]">
                <h3 className="h-[50px] text-[18px] font-[600] line-clamp-2">
                  {possibleMutation.pharmacy_name}
                </h3>
                <p>{possibleMutation.pharmacy_address}</p>
                <div className="flex mt-auto py-[5px] gap-[10px]">
                  <p className="text-[16px] font-[500]">Current Stock</p>
                  <p className="text-[16px] font-[600]">
                    {possibleMutation.stock}
                  </p>
                </div>
                {status[possibleMutation.pharmacy_drug_id] &&
                  status[possibleMutation.pharmacy_drug_id].status ==
                    "listing" && (
                    <button
                      onClick={() => {
                        setStatus((prevVal) => ({
                          ...prevVal,
                          [possibleMutation.pharmacy_drug_id]: {
                            status: "requesting",
                          },
                        }));
                        setItemQuantities((prevVal) => {
                          if (!prevVal) {
                            return {
                              [possibleMutation.pharmacy_drug_id]: {
                                quantity: 1,
                              },
                            };
                          }

                          return {
                            ...prevVal,
                            [possibleMutation.pharmacy_drug_id]: {
                              quantity: 1,
                            },
                          };
                        });
                      }}
                      className="mt-auto w-fit ml-auto bg-gray-600 text-white font-[600] px-[15px] py-[5px] rounded-xl"
                    >
                      Request
                    </button>
                  )}
                {status[possibleMutation.pharmacy_drug_id] &&
                  status[possibleMutation.pharmacy_drug_id].status ==
                    "requesting" && (
                    <div className="flex mt-auto w-full justify-between items-center">
                      <div className="flex gap-4 items-center justify-center">
                        <button
                          type="button"
                          className="border-[1px] rounded-[10%] p-2 bg-white hover:scale-105"
                          onClick={() => {
                            if (!itemQuantities) {
                              return;
                            }

                            if (
                              itemQuantities[possibleMutation.pharmacy_drug_id]
                                .quantity == 1
                            ) {
                              setStatus((prevVal) => ({
                                ...prevVal,
                                [possibleMutation.pharmacy_drug_id]: {
                                  status: "listing",
                                },
                              }));
                              return;
                            }

                            setItemQuantities((prevVal) => {
                              if (!prevVal) {
                                return;
                              }

                              return {
                                ...prevVal,
                                [possibleMutation.pharmacy_drug_id]: {
                                  quantity:
                                    prevVal[possibleMutation.pharmacy_drug_id]
                                      .quantity - 1,
                                },
                              };
                            });
                          }}
                        >
                          <FaMinus />
                        </button>
                        <input
                          className="w-[40px] text-[18px] py-[2px] px-[5px] rounded-md flex justify-center items-center"
                          value={
                            itemQuantities
                              ? itemQuantities[
                                  possibleMutation.pharmacy_drug_id
                                ].quantity
                              : 1
                          }
                          onChange={(e) => {
                            if (isNaN(+e.target.value)) {
                              return;
                            }

                            setItemQuantities((prevVal) => ({
                              ...prevVal,
                              [possibleMutation.pharmacy_drug_id]: {
                                quantity: +e.target.value,
                              },
                            }));
                          }}
                          onBlur={() => {
                            if (
                              itemQuantities &&
                              itemQuantities[possibleMutation.pharmacy_drug_id]
                                .quantity == 0
                            ) {
                              setStatus((prevVal) => ({
                                ...prevVal,
                                [possibleMutation.pharmacy_drug_id]: {
                                  status: "listing",
                                },
                              }));
                            }
                          }}
                        ></input>
                        <button
                          type="button"
                          className="border-[1px] rounded-[10%] p-2  bg-white hover:scale-105 disabled:text-gray-300"
                          onClick={() => {
                            if (!itemQuantities) {
                              return;
                            }

                            if (
                              itemQuantities[possibleMutation.pharmacy_drug_id]
                                .quantity == possibleMutation.stock
                            ) {
                              return;
                            }

                            setItemQuantities((prevVal) => {
                              if (!prevVal) {
                                return;
                              }

                              return {
                                ...prevVal,
                                [possibleMutation.pharmacy_drug_id]: {
                                  quantity:
                                    prevVal[possibleMutation.pharmacy_drug_id]
                                      .quantity + 1,
                                },
                              };
                            });
                          }}
                        >
                          <FaPlus />
                        </button>
                      </div>
                      <div className="flex gap-[10px]">
                        <button
                          onClick={() =>
                            setStatus((prevVal) => ({
                              ...prevVal,
                              [possibleMutation.pharmacy_drug_id]: {
                                status: "listing",
                              },
                            }))
                          }
                          className="px-[15px] bg-[#ff0000] font-[600] text-white py-[5px] rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (!itemQuantities) {
                              return;
                            }

                            handlePostMutation(
                              possibleMutation.pharmacy_drug_id,
                              itemQuantities[possibleMutation.pharmacy_drug_id]
                                .quantity
                            );
                          }}
                          className="px-[15px] bg-[#14c57b] font-[600] text-white py-[5px] rounded-xl"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ManagerRequestStock;
