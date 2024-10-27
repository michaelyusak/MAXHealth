import React, { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HandleAddRaw, HandleGet } from "../util/API";
import AddressForm from "../components/AddressForm";
import Dialog from "../components/Dialog";
import AddressMap from "../components/AddressMap";
import AddAddressCard from "../components/AddAddressCard";
import chevronLeftIcon from "../assets/img/chevron-left-icon.png";
import chevronRightIcon from "../assets/img/chevron-right-icon.png";
import pinIcon from "../assets/img/pin-icon.png";
import { IAddress } from "../interfaces/Address";
import { HandleShowToast } from "../util/ShowToast";
import { ToastContext } from "../contexts/ToastData";
import { Noop } from "../constants/Noop";
import { ICheckoutPreparation } from "../interfaces/Prescription";
import { FaLongArrowAltRight, FaMapPin } from "react-icons/fa";
import { CurrencyFormatter } from "../util/CurrencyFormatter";
import { RxCross2 } from "react-icons/rx";
import {
  IOrderFromPrescriptionRequest,
  IOrderPharmacyFromPrescriptionRequest,
} from "../interfaces/Order";
import { MsgDrugNotAvailableInNearby } from "../appconstants/appconstants";
import { VscError } from "react-icons/vsc";
import { MdDone } from "react-icons/md";

const CheckoutFromPrescriptionPage = (): React.ReactElement => {
  const navigate = useNavigate();
  const { prescription_id } = useParams();

  const [addressOptions, setAddressOptions] = useState<IAddress[]>();
  const [selectedAddress, setSelectedAddress] = useState<IAddress>();
  const [selectedAddressOption, setSelectedAddressOption] =
    useState<IAddress>();
  const [showAddressOptions, setShowAddressOptions] = useState<boolean>(false);

  const [showAddAddressDialog, setShowAddAddressDialog] =
    useState<boolean>(false);
  const [showMapDialog, setShowMapDialog] = useState<boolean>(false);
  const [showAddSearchedAddressDialog, setShowSearchedAddAddressDialog] =
    useState<boolean>(false);
  const [showManuallyAddAddressDialog, setShowManuallyAddAddressDialog] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);

  const { setToast } = useContext(ToastContext);

  const [checkoutItemList, setCheckoutItemList] =
    useState<ICheckoutPreparation>();

  const [selectedPharmacyCourier, setSelectedPharmacyCourier] = useState<{
    [pharmacyId: number]: { courierId: number; price: number };
  }>();

  const [showNoDrugNearbyDiv, setShowNoDrugNearbyDiv] =
    useState<boolean>(false);

  const [orderId, setOrderId] = useState<number>();

  function handleSelectCourier(
    courierId: number,
    pharmacyId: number,
    fee: number
  ) {
    setSelectedPharmacyCourier((prevVal) =>
      !prevVal
        ? {
            [pharmacyId]: { courierId: courierId, price: fee },
          }
        : {
            ...prevVal,
            [pharmacyId]: { courierId: courierId, price: fee },
          }
    );
  }

  useEffect(() => {
    if (!checkoutItemList) {
      return;
    }

    let t = 0;
    checkoutItemList.pharmacy_drugs.map((checkoutItem) => {
      t += +checkoutItem.subtotal;

      if (
        selectedPharmacyCourier &&
        selectedPharmacyCourier[checkoutItem.pharmacy_id]
      ) {
        if (selectedPharmacyCourier[checkoutItem.pharmacy_id].price) {
          t += selectedPharmacyCourier[checkoutItem.pharmacy_id].price;
        }
      }
    });

    setTotal(t);
  }, [checkoutItemList, selectedPharmacyCourier]);

  useEffect(() => {
    if (!selectedAddress) {
      return;
    }

    const url =
      import.meta.env.VITE_HTTP_BASE_URL +
      `/prescriptions/${prescription_id}?address_id=${selectedAddress.id}`;

    setIsLoading(true);
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
    document.body.style.overflow = "hidden";

    HandleGet<ICheckoutPreparation>(url, true)
      .then((responseData) => {
        setCheckoutItemList(responseData);
      })
      .catch((error: Error) => {
        if (error.message.includes(MsgDrugNotAvailableInNearby)) {
          setShowNoDrugNearbyDiv(true);
          HandleShowToast(
            setToast,
            false,
            "Sorry, This drug is not available in your area.",
            7
          );
          return;
        }

        HandleShowToast(setToast, false, error.message, 5);
      })
      .finally(() => {
        setIsLoading(false);
        document.body.style.overflow = "auto";
      });
  }, [prescription_id, selectedAddress, setToast]);

  const getAddress = useCallback(() => {
    const url = import.meta.env.VITE_HTTP_BASE_URL + "/address";

    HandleGet<{ address: IAddress[] }>(url, true)
      .then((responseData) => {
        setAddressOptions(responseData.address);
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 5);
      });
  }, [setToast]);

  function handlePlaceOrder() {
    const url = import.meta.env.VITE_HTTP_BASE_URL + "/prescriptions/checkout";

    if (!selectedAddress) {
      HandleShowToast(setToast, false, "Select an address first", 5);
      return;
    }

    if (!selectedAddress.address) {
      HandleShowToast(
        setToast,
        false,
        "Your address is invalid, reload the page or add new address",
        5
      );
      return;
    }

    if (!checkoutItemList) {
      HandleShowToast(setToast, false, "You have nothing to checkout", 5);
      return;
    }

    if (!selectedPharmacyCourier) {
      HandleShowToast(
        setToast,
        false,
        "Choose a delivery method for each pharmacy",
        5
      );
      return;
    }

    if (!prescription_id) {
      HandleShowToast(setToast, false, "Unrecognized prescription", 5);
      return;
    }

    const pharmaciesData: IOrderPharmacyFromPrescriptionRequest[] = [];

    checkoutItemList.pharmacy_drugs.forEach((checkoutItem) => {
      const pharmacyDrugsData: {
        pharmacy_drug_id: number;
        quantity: number;
      }[] = [];

      checkoutItem.drug_quantities.forEach((drugQuantity) => {
        pharmacyDrugsData.push({
          pharmacy_drug_id: drugQuantity.pharmacy_drug.id,
          quantity: drugQuantity.quantity,
        });
      });

      const pharmacyData: IOrderPharmacyFromPrescriptionRequest = {
        pharmacy_id: checkoutItem.pharmacy_id,
        pharmacy_courier_id:
          selectedPharmacyCourier[checkoutItem.pharmacy_id].courierId,
        delivery_fee: selectedPharmacyCourier[checkoutItem.pharmacy_id].price,
        subtotal_amount: +checkoutItem.subtotal,
        pharmacy_drugs: pharmacyDrugsData,
      };

      pharmaciesData.push(pharmacyData);
    });

    const data: IOrderFromPrescriptionRequest = {
      address: selectedAddress.address,
      total_amount: +total,
      prescription_id: +prescription_id,
      pharmacies: pharmaciesData,
    };

    setIsLoading(true);
    HandleAddRaw<{ order_id: number }>(url, JSON.stringify(data), true)
      .then((responseData) => {
        HandleShowToast(setToast, true, "Order Created!", 5);

        setOrderId(responseData.order_id);

        window.scrollTo({ top: 0, behavior: "smooth" });
        document.body.style.overflow = "auto";
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 5);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    getAddress();
  }, [getAddress]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }, []);

  return (
    <>
      {isLoading && (
        <div
          className="absolute w-[100vw] top-0 left-0 h-[100vh] bg-black opacity-60 animate-pulse"
          style={{ scrollbarWidth: "none" }}
        ></div>
      )}
      {showAddressOptions && (
        <Dialog
          cardWidth="xl:w-[60%] md:w-[70%] w-[90%]"
          content={
            <div className="flex flex-col gap-[1rem]">
              <div className="flex flex-row gap-[1rem] itms-center">
                <img
                  className="w-[30px] cursor-pointer"
                  alt="Chevron Left Icon"
                  src={chevronLeftIcon}
                  onClick={() => {
                    setShowAddressOptions(false);
                    setSelectedAddressOption(undefined);
                  }}
                />
                <p className="font-bold text-[20px]">Choose your address</p>
              </div>
              <div
                className="flex flex-col gap-[0.5rem] overflow-y-auto max-h-[500px]"
                style={{ scrollbarWidth: "thin" }}
              >
                {addressOptions?.map((address) => (
                  <div
                    key={address.id}
                    className="w-full flex flex-row justify-start items-center gap-[1rem] text-navy text-[17px] cursor-pointer"
                    onClick={() => {
                      setSelectedAddressOption(address);
                    }}
                  >
                    <div
                      className={`h-[19px] w-[23px] p-[2px] border-[2px] ${
                        selectedAddressOption === address
                          ? "border-brightBlue"
                          : "border-[#7b7c7c]"
                      } rounded-full`}
                    >
                      <div
                        className={`h-[11px] w-[11px] ${
                          selectedAddressOption === address
                            ? "bg-brightBlue"
                            : ""
                        } rounded-full`}
                      ></div>
                    </div>
                    <p>{address.address}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-[10px]">
                <button
                  onClick={() => {
                    setShowAddressOptions(false);
                    setShowAddAddressDialog(true);
                  }}
                  className="py-[5px] bg-[#13C57A] text-white cursor-pointer rounded-[8px] w-[120px] self-center"
                >
                  Add Address
                </button>

                <button
                  className="py-[5px] bg-[#3B81F6] text-white cursor-pointer rounded-[8px] w-[120px] self-center"
                  onClick={() => {
                    if (
                      selectedAddress !== selectedAddressOption &&
                      selectedAddressOption
                    ) {
                      setIsLoading(true);
                      setSelectedAddress(selectedAddressOption);
                    }
                    setShowAddressOptions(false);
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          }
          onClose={() => {
            setShowAddressOptions(false);
            setSelectedAddressOption(undefined);
          }}
        />
      )}
      {showAddAddressDialog && (
        <Dialog
          content={
            <AddAddressCard
              onNextStep={() => {
                setShowAddAddressDialog(false);
                setShowMapDialog(true);
              }}
              onManualAdd={() => {
                setShowAddAddressDialog(false);
                setShowManuallyAddAddressDialog(true);
              }}
            />
          }
          onClose={() => {
            setShowAddAddressDialog(false);
          }}
        />
      )}
      {showMapDialog && (
        <Dialog
          content={
            <AddressMap
              onNextStep={() => {
                setShowMapDialog(false);
                setShowSearchedAddAddressDialog(true);
              }}
              onManualAdd={() => {
                setShowMapDialog(false);
                setShowManuallyAddAddressDialog(true);
              }}
            />
          }
          onClose={() => {
            setShowMapDialog(false);
          }}
        />
      )}
      {showAddSearchedAddressDialog && (
        <Dialog
          content={
            <AddressForm
              onSubmit={() => {
                setShowSearchedAddAddressDialog(false);
                setShowAddressOptions(true);
                getAddress();
              }}
              isFilled
              onManualAdd={() => {
                setShowSearchedAddAddressDialog(false);
                setShowManuallyAddAddressDialog(true);
              }}
            />
          }
          onClose={() => {
            setShowSearchedAddAddressDialog(false);
          }}
        />
      )}
      {showManuallyAddAddressDialog && (
        <Dialog
          content={
            <AddressForm
              onSubmit={() => {
                setShowManuallyAddAddressDialog(false);
                setShowAddressOptions(true);
                getAddress();
              }}
              onManualAdd={Noop}
            />
          }
          onClose={() => {
            setShowManuallyAddAddressDialog(false);
          }}
        />
      )}
      {orderId && (
        <>
          <div
            className="absolute w-[100vw] top-0 left-0 h-[100vh] bg-black opacity-60"
            style={{ scrollbarWidth: "none" }}
          ></div>
          <div className="w-[30vw] h-[50vh] bg-white absolute flex flex-col justify-between items-center top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] rounded-2xl p-[30px]">
            <div className="p-[10px] bg-[#14C57B] rounded-[100%] aspect-square">
              <MdDone className="m-auto text-[200px] text-white" />
            </div>
            <h1 className="text-[30px] font-[800] text-[#000D44]">
              Order Created!
            </h1>
            <div className="flex items-center flex-col gap-[10px]">
              <button
                onClick={() => navigate(`/orders/payment/${orderId}`)}
                className="bg-[#DFF1FD] px-[20px] flex items-center py-[10px] rounded-[8px] "
              >
                <p className="text-[20px] font-[600]">Continue to payment</p>
              </button>
              <button
                onClick={() => navigate("/")}
                className="text-[#1F5FFF] w-fit font-[600] text-[18px] border-b-2 border-[#1F5FFF]"
              >
                Back to Home Page
              </button>
            </div>
          </div>
        </>
      )}
      <div className="flex flex-col gap-[20px]">
        <div
          className="flex flex-row gap-[0.75rem] w-fit items-center border-[1px] px-[10px] py-[5px] cursor-pointer"
          onClick={() => {
            setShowAddressOptions(true);
            if (selectedAddress) setSelectedAddressOption(selectedAddress);
          }}
        >
          <div className="flex flex-col gap-[0.75rem]">
            <div className="flex flex-row items-center gap-[0.5rem]">
              <img className="w-[20px]" alt="Pin Icon" src={pinIcon} />
              <p className="text-navy text-[17px] font-bold">
                Shipping address
              </p>
            </div>
            {selectedAddress ? (
              <p>{selectedAddress.address}</p>
            ) : (
              <p>Choose address</p>
            )}
          </div>

          <img
            className="w-[30px]"
            alt="Chevron Right Icon"
            src={chevronRightIcon}
          />
        </div>
        {showNoDrugNearbyDiv && (
          <div className="w-[90%] md:w-[70%] xl:w-[50%] mx-auto my-[30px] flex flex-col gap-[50px] items-center justify-center p-[20px] border-2 border-slate-400 rounded-2xl">
            <VscError className="text-[200px] text-[#000D44]" />
            <div>
              <p className="text-center text-[20px]">
                Sorry, This drug is not available in your area. Please ask your
                doctor for alternatives. If your consultation session is over,
                please contact our customer service.
              </p>
            </div>
          </div>
        )}
        <div className="p-4 flex flex-col gap-[20px]">
          {checkoutItemList && checkoutItemList.pharmacy_drugs.length > 0
            ? checkoutItemList.pharmacy_drugs.map((checkoutItem) => (
                <div className="shadow-[rgba(0,_0,_0,_0.4)_0px_20px_50px] bg-white rounded-xl p-[10px]">
                  <div className="flex w-full justify-between items-center">
                    <div className="flex flex-col">
                      <p className="text-[22px] font-[600]">
                        {checkoutItem.pharmacy_name}
                      </p>
                      <p className="text-[16px]">
                        {checkoutItem.pharmacy_address}
                      </p>
                    </div>
                    <div className="flex items-center gap-[10px]">
                      <FaMapPin className="text-[20px] text-[#000D44]" />
                      <p className="text-[18px] text-[#000D44]">
                        {Math.round(checkoutItem.distance / 1000)} km Away from
                        you
                      </p>
                    </div>
                  </div>
                  <div className="p-[20px] w-[100%] flex flex-col gap-[20px]">
                    {checkoutItem.drug_quantities &&
                      checkoutItem.drug_quantities.map((drugQuantity) => (
                        <div className="py-[5px] border-2 border-slate-400 bg-white px-[10px] rounded-xl flex w-[100%] justify-between items-center">
                          <img
                            alt=""
                            src={drugQuantity.pharmacy_drug.drug.image}
                            className="h-[320px] aspect-square object-cover rounded-xl"
                          ></img>
                          <div className="w-[50%]">
                            <p className="text-[18px] font-[600] h-[70px] line-clamp-3">
                              {drugQuantity.pharmacy_drug.drug?.name}
                            </p>
                            <p className="text-[18px] py-[2px]">
                              {drugQuantity.pharmacy_drug.drug.manufacture}
                            </p>
                            <p className="font-[600]">
                              {CurrencyFormatter.format(
                                drugQuantity.pharmacy_drug?.price
                              )}{" "}
                              {drugQuantity.pharmacy_drug.drug.selling_unit}
                            </p>
                            <p className="flex items-center text-[16px] font-[700]">
                              <RxCross2 /> {drugQuantity.quantity}
                            </p>
                          </div>
                          <div className="flex items-center text-[20px] font-[800] text-[#1F5FFF]">
                            <p>
                              {CurrencyFormatter.format(
                                drugQuantity.quantity *
                                  drugQuantity.pharmacy_drug?.price
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    <div className="flex w-[100%] justify-between items-center">
                      <div className="flex flex-col gap-[5px]">
                        <p className="text-[18px] font-[600]">
                          Choose Delivery Method
                        </p>
                        {checkoutItem.couriers ? (
                          checkoutItem.couriers.length > 0 &&
                          checkoutItem.couriers.map((courier) => (
                            <>
                              <div className="flex gap-[20px]">
                                <button
                                  onClick={() =>
                                    handleSelectCourier(
                                      courier.pharmacy_courier_id,
                                      checkoutItem.pharmacy_id,
                                      courier.options[0]?.price
                                    )
                                  }
                                  disabled={courier.options.length < 1}
                                  className="w-[25px] aspect-square border-4 border-[#14C57B] disabled:opacity-60 rounded-xl"
                                >
                                  <div
                                    className={`w-[70%] m-auto aspect-square rounded-[100%] ${
                                      selectedPharmacyCourier &&
                                      selectedPharmacyCourier[
                                        checkoutItem.pharmacy_id
                                      ] != undefined &&
                                      selectedPharmacyCourier[
                                        checkoutItem.pharmacy_id
                                      ].courierId == courier.pharmacy_courier_id
                                        ? "bg-[#14C57B]"
                                        : "bg-transparent"
                                    }`}
                                  ></div>
                                </button>
                                <div className="flex">
                                  <p className="w-[150px] capitalize">
                                    {courier.courier_name}
                                  </p>
                                  {courier.options.length > 0 && (
                                    <p className="w-[200px] font-[600] text-center">
                                      {CurrencyFormatter.format(
                                        courier.options[0]?.price
                                      )}
                                    </p>
                                  )}
                                  {courier.options.length > 0 && (
                                    <p className="w-[100px] lowercase">
                                      {
                                        courier.options[0]
                                          .estimated_time_of_delivery
                                      }
                                    </p>
                                  )}
                                </div>
                              </div>
                            </>
                          ))
                        ) : (
                          <div>Currently no delivery option.</div>
                        )}
                      </div>
                      <div className="w-[20%] h-fit">
                        <p className="text-[20px] font-[600]">Total</p>
                        <p className="text-right text-[18px] font-[600] text-[#000D44]">
                          {selectedPharmacyCourier != undefined &&
                          selectedPharmacyCourier[checkoutItem?.pharmacy_id] !=
                            undefined
                            ? CurrencyFormatter.format(
                                +checkoutItem?.subtotal +
                                  +selectedPharmacyCourier[
                                    checkoutItem.pharmacy_id
                                  ]?.price
                              )
                            : "Choose Delivery Option"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            : !showNoDrugNearbyDiv && <div className="h-[500px]"></div>}
          <div className="bg-[#14C57B] text-white mt-[50px] p-[20px] w-[100%] flex justify-between items-center">
            <div className="text-[20px] font-[600]">
              <p>Total</p>
              <p className="text-[24px] font-[800]">
                {CurrencyFormatter.format(total)}
              </p>
            </div>
            <button
              onClick={() => handlePlaceOrder()}
              className="font-[600] rounded-xl text-[20px] hover:shadow-[0px_0px_10px_5px_#CBD5E0] flex items-center gap-[10px] p-[10px]"
            >
              Check Out <FaLongArrowAltRight />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutFromPrescriptionPage;
