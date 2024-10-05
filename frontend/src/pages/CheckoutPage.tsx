import React, { useCallback, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

import pinIcon from "../assets/img/pin-icon.png";
import checkIcon from "../assets/img/check-icon.png";
import chevronLeftIcon from "../assets/img/chevron-left-icon.png";
import chevronRightIcon from "../assets/img/chevron-right-icon.png";
import Dialog from "../components/Dialog";
import CheckoutItem from "../components/CheckoutItem";
import { ToastContext } from "../contexts/ToastData";
import { IAddress } from "../interfaces/Address";
import { useAppDispatch, useAppSelector } from "../redux/reduxHooks";
import { HandleAddRaw, HandleGet } from "../util/API";
import AddAddressCard from "../components/AddAddressCard";
import { HandleShowToast } from "../util/ShowToast";
import { CurrencyFormatter } from "../util/CurrencyFormatter";
import AddressMap from "../components/AddressMap";
import AddressForm from "../components/AddressForm";
import { Noop } from "../constants/Noop";
import { Link, useNavigate } from "react-router-dom";
import { path } from "../router/path";
import Button from "../components/Button";
import {
  setItemsInsufficient,
  updateAddress,
  updateShippingOptions,
} from "../slices/OrderSlice";
import { IOrderPharmacyRequest, IPharmacyCourier } from "../interfaces/Order";
import {
  MsgInsufficientStock,
  MsgRefreshTokenNotFound,
} from "../appconstants/appconstants";
import { cartActions } from "../slices/CartSlice";

const CheckoutPage = (): React.ReactElement => {
  const navigate = useNavigate();
  const { setToast } = useContext(ToastContext);

  const dispatch = useAppDispatch();
  const {
    cartItemIds,
    pharmacyItems,
    productsSubtotal,
    shippingSubtotal,
    total,
    disabledOrder,
    address,
  } = useAppSelector((state) => state.order);

  const [addressOptions, setAddressOptions] = useState<IAddress[]>();
  const [selectedAddress, setSelectedAddress] = useState<IAddress>(
    address ?? undefined
  );
  const [selectedAddressOption, setSelectedAddressOption] = useState<
    IAddress | undefined
  >(address ?? undefined);
  const [showAddressOptions, setShowAddressOptions] = useState<boolean>(false);

  const [showAddAddressDialog, setShowAddAddressDialog] =
    useState<boolean>(false);
  const [showMapDialog, setShowMapDialog] = useState<boolean>(false);
  const [showAddSearchedAddressDialog, setShowSearchedAddAddressDialog] =
    useState<boolean>(false);
  const [showManuallyAddAddressDialog, setShowManuallyAddAddressDialog] =
    useState<boolean>(false);
  const [showPlaceOrderSuccess, setShowPlaceOrderSuccess] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [orderId, setOrderId] = useState<number>(0);

  const handlePlaceOrder = () => {
    const pharmacies: IOrderPharmacyRequest[] = [];

    let totalAmount = 0;
    for (let i = 0; i < pharmacyItems.length; i++) {
      const item = pharmacyItems[i];
      if (item.deliveryFee > 0 && item.pharmacyCourier[0] > 0) {
        pharmacies.push({
          pharmacy_id: item.pharmacyId,
          pharmacy_courier_id: item.pharmacyCourier[0],
          subtotal_amount: item.subtotal,
          delivery_fee: item.deliveryFee,
          cart_items: item.items.map((it) => it.cart_item_id),
        });
        totalAmount += item.subtotal;
        totalAmount += item.deliveryFee;
      }
    }

    const cookiesData: { user_id: number } = JSON.parse(
      Cookies.get("data") ?? ""
    );

    const url = import.meta.env.VITE_DEPLOYMENT_URL + "/orders";

    HandleAddRaw(
      url,
      JSON.stringify({
        accountId: cookiesData.user_id,
        address: selectedAddress?.address ?? "",
        total_amount: totalAmount,
        pharmacies: pharmacies,
      }),
      true
    )
      .then((responseData) => {
        const res = responseData as { order_id: number };
        setOrderId(res.order_id);
        dispatch(cartActions.subtractTotalQuantity(total));
        setShowPlaceOrderSuccess(true);
        setTimeout(() => {
          setShowPlaceOrderSuccess(false);
          navigate(`${path.orders}/payment/${res.order_id}`);
        }, 5000);
      })
      .catch((err: Error) => {
        if (err.message.includes(MsgInsufficientStock)) {
          const insufficientItemIdsArrStr = err.message.split(":")[1];
          const insufficientItemIdsArr = JSON.parse(insufficientItemIdsArrStr);
          dispatch(setItemsInsufficient(insufficientItemIdsArr));
          HandleShowToast(
            setToast,
            false,
            "Some items have insuffienct stock",
            5
          );
        } else {
          HandleShowToast(setToast, false, err.message, 5);
        }
      });
  };

  const getAddress = useCallback(() => {
    const url = import.meta.env.VITE_DEPLOYMENT_URL + "/address";

    HandleGet<{ address: IAddress[] }>(url, true)
      .then((responseData) => {
        setAddressOptions(responseData.address);
      })
      .catch((error: Error) => {
        if (error.message == MsgRefreshTokenNotFound) {
          navigate("/auth/login");
        }
        HandleShowToast(setToast, false, error.message, 5);
      });
  }, [navigate, setToast]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
    getAddress();
  }, [getAddress]);

  useEffect(() => {
    if (selectedAddress && selectedAddress.id && selectedAddress.id > 0) {
      setIsLoading(true);

      const cookiesData: { user_id: number } = JSON.parse(
        Cookies.get("data") ?? ""
      );

      const url = import.meta.env.VITE_DEPLOYMENT_URL + "/cart/delivery";
      HandleAddRaw<{ pharmacies: IPharmacyCourier[] }>(
        url,
        JSON.stringify({
          user_address_id: Number(selectedAddress?.id),
          cart_items_id: cartItemIds,
          account_id: cookiesData.user_id,
        }),
        true
      )
        .then((responseData) => {
          dispatch(updateShippingOptions(responseData.pharmacies));
          dispatch(updateAddress(selectedAddress));
          HandleShowToast(setToast, true, "Shipping cost updated", 5);
        })
        .catch((error: Error) => {
          if (error.message == MsgRefreshTokenNotFound) {
            navigate("/auth/login");
          }
          HandleShowToast(setToast, false, error.message, 5);
        })
        .finally(() => setIsLoading(false));
    }
  }, [dispatch, cartItemIds, navigate, selectedAddress, setToast]);

  return (
    <>
      {cartItemIds.length > 0 ? (
        <div className="flex flex-col gap-[2rem] p-2">
          <div
            className="flex flex-row gap-[0.75rem] justify-between items-center border-[1px] p-4 w-[95%] m-2 md:w-[40%] cursor-pointer"
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
              {selectedAddress &&
              selectedAddress.id &&
              selectedAddress.id > 0 ? (
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
          <CheckoutItem />
          <p className="text-navy text-[20px] font-bold">Payment Details</p>
          <table className="w-fit border-[1px] text-navy text-[17px] font-bold">
            <tr>
              <td className="border-[1px] p-4 w-[300px] bg-lightGrey">
                <div className="flex justify-start font-bold">
                  Subtotal for products
                </div>
              </td>
              <td className="border-[1px] p-4 w-[300px]">
                <div className="flex justify-start text-[#7b7c7c]">
                  {CurrencyFormatter.format(productsSubtotal)}
                </div>
              </td>
            </tr>
            <tr>
              <td className="border-[1px] p-4 w-[300px] bg-lightGrey">
                <div className="flex justify-start font-bold">
                  Subtotal for shipping
                </div>
              </td>
              <td className="border-[1px] p-4 w-[300px]">
                <div className="flex justify-start text-[#7b7c7c]">
                  {CurrencyFormatter.format(shippingSubtotal)}
                </div>
              </td>
            </tr>
            <tr>
              <td className="border-[1px] p-4 w-[300px] bg-lightGrey">
                <div className="flex justify-start font-bold">
                  Total payment
                </div>
              </td>
              <td className="border-[1px] p-4 w-[300px]">
                <div className="flex justify-start text-primaryGreen">
                  {CurrencyFormatter.format(total)}
                </div>
              </td>
            </tr>
          </table>
          <div className="flex">
            <Button
              type="button"
              buttonStyle="green"
              onClick={handlePlaceOrder}
              disabled={disabledOrder}
              additionalClassName="py-2 px-3 rounded-lg"
            >
              Place order
            </Button>
          </div>
          {showPlaceOrderSuccess && (
            <Dialog
              content={
                <div className="relative flex flex-col gap-[2rem] justify-center items-center">
                  <img className="w-[100px]" alt="Check Icon" src={checkIcon} />
                  <p className="text-navy text-[20px] font-bold">
                    Order Placed Succesfully
                  </p>
                  <Link to={`${path.orders}/payment/${orderId}`}>
                    <p className="text-brightBlue">Upload payment proof</p>
                  </Link>
                  <p>Page will be automatically directed in 5s</p>
                </div>
              }
            />
          )}
          {showAddressOptions && (
            <Dialog
              cardWidth="w-[100%] md:w-[700px]"
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
                  <div className="flex flex-col gap-[0.5rem]">
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
                        <div className="flex flex-col gap-[0.5rem]">
                          {address.is_main && (
                            <div className="w-fit px-[0.25rem] py-[0.15rem] text-[#1F5FFF] text-[16px] border-[1px] border-[#1F5FFF]">
                              Main
                            </div>
                          )}
                          <p>{address.address}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setShowAddressOptions(false);
                      setShowAddAddressDialog(true);
                    }}
                  >
                    Add address
                  </button>
                  <Button
                    type="button"
                    buttonStyle="blue"
                    additionalClassName="py-2 px-3 rounded-lg"
                    onClick={() => {
                      if (
                        selectedAddress !== selectedAddressOption &&
                        selectedAddressOption
                      ) {
                        setIsLoading(true);
                        setSelectedAddress(selectedAddressOption);
                        const cookiesData: { user_id: number } = JSON.parse(
                          Cookies.get("data") ?? ""
                        );
                        const url =
                          import.meta.env.VITE_DEPLOYMENT_URL +
                          "/cart/delivery";
                        HandleAddRaw<{ pharmacies: IPharmacyCourier[] }>(
                          url,
                          JSON.stringify({
                            user_address_id: Number(selectedAddressOption?.id),
                            cart_items_id: cartItemIds,
                            account_id: cookiesData.user_id,
                          }),
                          true
                        )
                          .then((responseData) => {
                            dispatch(
                              updateShippingOptions(responseData.pharmacies)
                            );
                            dispatch(updateAddress(selectedAddressOption));
                            HandleShowToast(
                              setToast,
                              true,
                              "Shipping cost updated",
                              5
                            );
                          })
                          .catch((error: Error) => {
                            if (error.message == MsgRefreshTokenNotFound) {
                              navigate("/auth/login");
                            }
                            HandleShowToast(setToast, false, error.message, 5);
                          })
                          .finally(() => setIsLoading(false));
                      }
                      setShowAddressOptions(false);
                    }}
                  >
                    Save
                  </Button>
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
        </div>
      ) : (
        <div className="min-h-[calc(100vh-500px)] flex flex-col gap-[1rem] items-center justify-center">
          <p>Please select items to checkout first</p>
          <Link to={path.cart}>
            <p className="text-brightBlue">Go to cart</p>
          </Link>
        </div>
      )}
      {isLoading && (
        <div className="fixed z-10 w-full h-[100vh] top-0 left-0 right-0 bottom-0 bg-[rgba(128,128,128,0.4)]">
          <svg
            aria-hidden="true"
            className="absolute top-[50%] left-[50%] z-20 w-14 h-14 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600 "
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
        </div>
      )}
    </>
  );
};

export default CheckoutPage;
