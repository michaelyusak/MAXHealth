import React, { useCallback, useContext, useEffect, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import ProductRelated from "../components/ProductRelated";
import { HandleGet } from "../util/API";
import { HandleShowToast } from "../util/ShowToast";
import { ToastContext } from "../contexts/ToastData";
import {
  IDetailResponsePharmacyDrug,
  IDrugDetailResponse,
} from "../interfaces/Drug";
import { CurrencyFormatter } from "../util/CurrencyFormatter";
import { IoMdClose } from "react-icons/io";
import { RiPinDistanceFill } from "react-icons/ri";
import { useAppDispatch, useAppSelector } from "../redux/reduxHooks";
import { cartActions } from "../slices/CartSlice";
import { sendCartPostData, sendCartUpdateData } from "../slices/CartActions";
import Cookies from "js-cookie";
import { store } from "../slices/InitailCategoryFilter";
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";
import { jwtDecode } from "jwt-decode";
import { IToken } from "../interfaces/Token";
import chevronRightIcon from "../assets/img/chevron-right-icon.png";
import chevronLeftIcon from "../assets/img/chevron-left-icon.png";
import Dialog from "../components/Dialog";
import Button from "../components/Button";
import { IAddress } from "../interfaces/Address";
import pinIcon from "../assets/img/pin-icon.png";
import { updateAddress } from "../slices/OrderSlice";

const ProductDetail = (): React.ReactElement => {
  const data = Cookies.get("data");

  const { setToast } = useContext(ToastContext);
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart);
  const orderStateData = useAppSelector((state) => state.order);
  const [accountId, setAccountId] = useState<number>(0);
  const [isTokenValid, setIsTokenValid] = useState<boolean>(false);

  const [isAddressLoading, setIsAddressLoading] = useState<boolean>(false);
  const [isDrugLoading, setIsDrugloading] = useState<boolean>(false);
  const [isAddrLoaded, setIsAddrLoaded] = useState<boolean>(false);

  const [selectedAddress, setSelectedAddress] = useState<IAddress | undefined>(
    orderStateData.address &&
      orderStateData.address.id &&
      orderStateData.address.id > 0
      ? orderStateData.address
      : undefined
  );

  useEffect(() => {
    if (!data) {
      setIsTokenValid(false);
      return;
    }

    const dataParsed = JSON.parse(data);

    const roleName = dataParsed["role"];

    if (!roleName) {
      setIsTokenValid(false);
      return;
    }

    if (roleName == "user") {
      setIsTokenValid(true);
      setAccountId(+dataParsed["user_id"]);
    }
  }, [data]);

  const addToCartHandler = (Id: number, price: string) => {
    dispatch(
      cartActions.addItemToCart({
        accountId: accountId,
        pharmacyDrugId: Id,
        drugName: drugDetail?.name,
        image: drugDetail?.image,
        quantity: 1,
        price: parseInt(price),
      })
    );
    dispatch(
      sendCartPostData({
        pharmacyDrugId: Id,
        quantity: 1,
      })
    );
  };

  function handleSetItemQty(key: number, diff: number) {
    let cartItemId = -1;
    let quantity = -1;
    let price = -1;
    for (let i = 0; i < cart.pharmacyItems.length; i++) {
      const items = cart.pharmacyItems[i].items;
      for (let j = 0; j < items.length; j++) {
        const item = items[j];
        if (item.pharmacy_drugs.pharmacy_drug_id === key) {
          cartItemId = item.cart_item_id;
          quantity = item.quantity;
          price = item.price;
        }
      }
    }

    dispatch(
      sendCartUpdateData({
        cart_item_id: cartItemId,
        quantity: quantity + diff,
      })
    );

    dispatch(
      cartActions.addQuantityCart({
        cartItemId: cartItemId,
        quantity: quantity + diff,
        price: parseInt(String(price)),
      })
    );
  }

  const { id } = useParams<{ id: string }>();

  const findQuantity = (pharmacyDrugId: number): number => {
    for (let i = 0; i < cart.pharmacyItems.length; i++) {
      const items = cart.pharmacyItems[i].items;
      for (let j = 0; j < items.length; j++) {
        const item = items[j];
        if (item.pharmacy_drugs.pharmacy_drug_id === pharmacyDrugId) {
          return item.quantity;
        }
      }
    }
    return -1;
  };

  const fetchProductDetail = useCallback(
    (latitude: string, longitude: string) => {
      const url =
        import.meta.env.VITE_HTTP_BASE_URL +
        `/drugs/${id}?lat=${latitude}&long=${longitude}&page=&limit=`;

      setIsDrugloading(true)
      HandleGet<IDrugDetailResponse>(url)
        .then((data) => {
          setDrugDetail(data);

          const initialQty: { [key: number]: { qty: number } } = {};

          data.pharmacy_drugs &&
            data.pharmacy_drugs.forEach(
              (pharmacyDrug: IDetailResponsePharmacyDrug) => {
                initialQty[pharmacyDrug.id] = {
                  qty: pharmacyDrug.stock > 0 ? 1 : 0,
                };
              }
            );
        })
        .catch((error: Error) => {
          if (error.message == MsgRefreshTokenNotFound) {
            HandleShowToast(setToast, false, error.message, 7, true);
            return;
          }

          HandleShowToast(setToast, false, error.message, 5);
        }).finally(() => {
          setIsDrugloading(false)
        });
    },
    [id, setToast]
  );

  function getLoc(): { lat: string, long: string } {
    let lat: string | undefined;
    let long: string | undefined;

    if (selectedAddress?.latitude && selectedAddress?.longitude) {
      lat = selectedAddress.latitude;
      long = selectedAddress.longitude;
    }

    else if (data) {
      const parsedData = JSON.parse(data);
      if (parsedData?.location?.lat && parsedData?.location?.long) {
        lat = parsedData.location.lat;
        long = parsedData.location.long;
      }
    }

    if (!lat || !long) {
      lat = "-6.1934332";
      long = "106.8217253";
    }

    return {
      lat: lat,
      long: long
    }
  }

  useEffect(() => {
    const loadAddress = async () => {
      setIsAddressLoading(true);
      const url = import.meta.env.VITE_HTTP_BASE_URL + "/address";

      try {
        const responseData = await HandleGet<{ address: IAddress[] }>(url, true);
        setAddressOptions(responseData.address);

        if (responseData.address.length > 0) {
          let mainAddress = responseData.address.find(addr => addr.is_main) ?? responseData.address[0];

          if (!selectedAddress || selectedAddress.id === 0) {
            setSelectedAddress(mainAddress);
            dispatch(updateAddress(mainAddress));
          }
        }
      } catch (error: any) {
        if (error.message !== MsgRefreshTokenNotFound) {
          HandleShowToast(setToast, false, error.message, 5);
        }
      } finally {
        setIsAddressLoading(false);
        setIsAddrLoaded(true);
      }
    };

    if (!token) {
      const loc = getLoc()

      fetchProductDetail(loc.lat, loc.long);

      return;
    }

    loadAddress();
  }, []);

  useEffect(() => {
    if (!isAddrLoaded || (isAddressLoading || isDrugLoading)) return;

    const loc = getLoc()

    fetchProductDetail(loc.lat, loc.long);
  }, [selectedAddress, data, isAddressLoading]);

  useEffect(() => {
    setIsLoading(isAddressLoading || isDrugLoading)
  }, [isAddressLoading, isDrugLoading])

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };
    scrollToTop();
  }, [id]);

  const [drugDetail, setDrugDetail] = useState<IDrugDetailResponse>();

  const token = Cookies.get("accessToken");

  useEffect(() => {
    if (token) {
      const payload = jwtDecode<IToken>(token);

      const now = new Date().getTime() / 1000;
      if (payload.exp || payload.exp > now) {
        setIsTokenValid(true);
        return;
      }
    }
  }, [token]);

  const [showAddressOptions, setShowAddressOptions] = useState<boolean>(false);
  const [addressOptions, setAddressOptions] = useState<IAddress[]>();
  const [selectedAddressOption, setSelectedAddressOption] = useState<
    IAddress | undefined
  >(
    orderStateData.address &&
      orderStateData.address.id &&
      orderStateData.address.id > 0
      ? orderStateData.address
      : undefined
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <>
      {isLoading && (
        <div className="fixed z-10 w-full h-[100vh] top-0 left-0 right-0 bottom-0 bg-[rgba(128,128,128,0.4)]" />
      )}
      {showAddressOptions && (
        <Dialog
          cardWidth="w-[700px]"
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
                      className={`h-[19px] w-[23px] p-[2px] border-[2px] ${selectedAddressOption &&
                        selectedAddressOption.id === address.id
                        ? "border-brightBlue"
                        : "border-[#7b7c7c]"
                        } rounded-full`}
                    >
                      <div
                        className={`h-[11px] w-[11px] ${selectedAddressOption &&
                          selectedAddressOption.id === address.id
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
              <Button
                type="button"
                buttonStyle="blue"
                onClick={() => {
                  if (
                    selectedAddress !== selectedAddressOption &&
                    selectedAddressOption
                  ) {
                    dispatch(updateAddress(selectedAddressOption));
                    setSelectedAddress(selectedAddressOption);
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
      <div className="flex flex-col md:flex-row justify-between px-[10px] md:px-[30px] xl:px-[50px]">
        <div className="flex flex-col md:w-[60%] w-[100%] gap-4 p-3 md:p-0">
          <div className="flex md:flex-row flex-col justify-between">
            <img
              className="object-cover object-center w-[350px] h-[350px]"
              src={drugDetail?.image}
              alt="image-product"
            />
            <div className="flex flex-col gap-1 md:w-[450px] w-[100%] justify-between">
              <div className="flex flex-col gap-[15px]">
                <p className="text-[20px] md:text-[28px] xl:text-[30px] font-[700] capitalize">
                  {drugDetail?.name}
                </p>
                {drugDetail?.pharmacy_drugs ? (
                  <div>
                    <p className="text-black font-[600] text-[18px] md:text-[20px] xl:text-[24px]">
                      {CurrencyFormatter.format(
                        +drugDetail?.pharmacy_drugs[0].price
                      )}
                    </p>
                    <p className="text-black font-[600] text-[16px] md:text-[16px] xl:text-[18px]">
                      {drugDetail?.selling_unit}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-[#E01A52] font-[600] text-[18px]">
                      This product is not available in your area
                    </p>
                    <p className="text-black font-[600] text-[16px]">
                      Please change your location, look for{" "}
                      <a
                        href="/product"
                        onClick={() =>
                          drugDetail &&
                          dispatch(store(drugDetail.category.id.toString()))
                        }
                        className="underline text-[#000D44]"
                      >
                        alternative product
                      </a>
                      , or{" "}
                      <a
                        href="/telemedicine/"
                        className="underline text-[#000D44]"
                      >
                        contact our doctor
                      </a>
                    </p>
                  </div>
                )}
              </div>
              <div className="flex flex-col md:w-[450px] w-[100%]">
                <div className="flex justify-between">
                  <p className="text-[16px] md:text-[16px] xl:text-[18px] font-[600]">
                    Category :{" "}
                  </p>
                  <Link
                    to="/product"
                    onClick={
                      drugDetail &&
                      (() => dispatch(store(drugDetail.category.id.toString())))
                    }
                  >
                    <p className="underline text-[#000D44] text-[16px] md:text-[16px] xl:text-[18px] font-[600]">
                      {drugDetail?.category.name}
                    </p>
                  </Link>
                </div>
                <div className="flex justify-between">
                  <p className="text-[16px] md:text-[16px] xl:text-[18px] font-[600]">
                    Weight :{" "}
                  </p>
                  <p className="text-[16px] md:text-[16px] xl:text-[18px]">
                    {drugDetail?.weight} g
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-[16px] md:text-[16px] xl:text-[18px] font-[600] flex items-center">
                    Dimension:
                  </p>
                  <p className="flex items-center text-[16px]">
                    ({drugDetail?.height} <IoMdClose></IoMdClose>{" "}
                    {drugDetail?.length} <IoMdClose></IoMdClose>{" "}
                    {drugDetail?.width}) m
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[15px]">
            <div className="flex flex-col gap-[5px]">
              <h3 className="text-[16px] md:text-[16px] xl:text-[18px] font-semibold text-[#5d5d5d]">
                Description
              </h3>
              <p className="text-[#74787c] text-justify text-[14px] md:text-[16px] xl:text-[18px]">
                {drugDetail?.description}
              </p>
            </div>

            <div className="flex flex-col gap-[5px]">
              <h3 className="text-[16px] md:text-[16px] xl:text-[18px] font-semibold text-[#5d5d5d]">
                Classification
              </h3>
              <p className="text-[#74787c] text-[14px] md:text-[16px] xl:text-[18px]">
                {drugDetail?.classification.name}
              </p>
            </div>

            <div className="flex flex-col gap-[5px]">
              <h3 className="text-[16px] md:text-[16px] xl:text-[18px] capitalize font-semibold text-[#5d5d5d]">
                Form
              </h3>
              <p className="text-[#74787c] text-[14px] md:text-[16px] xl:text-[18px]">
                {drugDetail?.form.name}
              </p>
            </div>

            <div className="flex flex-col gap-[5px]">
              <h3 className="text-[16px] md:text-[16px] xl:text-[18px] capitalize font-semibold text-[#5d5d5d]">
                Content
              </h3>
              <p className="text-[#74787c] text-[14px] md:text-[16px] xl:text-[18px]">
                {drugDetail?.content}
              </p>
            </div>

            <div className="flex flex-col gap-[5px]">
              <h3 className="text-[16px] md:text-[16px] xl:text-[18px] capitalize font-semibold text-[#5d5d5d]">
                Packaging
              </h3>
              <p className="text-[#74787c] text-[14px] md:text-[16px] xl:text-[18px]">
                {drugDetail?.unit_in_pack}
              </p>
            </div>

            <div className="flex flex-col gap-[5px]">
              <h3 className="text-[16px] md:text-[16px] xl:text-[18px] capitalize font-semibold text-[#5d5d5d]">
                Manufacture
              </h3>
              <p className="text-[#74787c] text-[14px] md:text-[16px] xl:text-[18px]">
                {drugDetail?.manufacture}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-[10px] md:w-[30%] w-[100%] border-2 border-zinc-200 rounded-xl p-[10px] h-fit">
          {token && (
            <div
              className="flex flex-row gap-[0.75rem] justify-between items-center border-[1px] p-4 w-[100%] cursor-pointer"
              onClick={() => {
                setShowAddressOptions(true);
                if (selectedAddress) setSelectedAddressOption(selectedAddress);
              }}
            >
              <div className="flex flex-col gap-[0.75rem]">
                <div className="flex flex-row items-center gap-[0.5rem]">
                  <img className="w-[20px]" alt="Pin Icon" src={pinIcon} />
                  <p className="text-navy text-[14px] md:text-[16px] xl:text-[17px] font-bold">
                    Shipping address
                  </p>
                </div>
                {selectedAddress ? (
                  <p className="line-clamp-2 text-[14px] md:text-[16px] xl:text-[17px]">
                    {selectedAddress.address}
                  </p>
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
          )}
          <div className="flex flex-col gap-1">
            <h2 className="text-[18px] md:text-[22px] xl:text-[24px] font-bold pl-2">
              Choose from a store
            </h2>
            <div
              className="border-2 border-zinc-200 p-2 rounded-xl flex flex-col gap-[10px] h-[auto] md:h-[70vh] overflow-y-auto"
              style={{ scrollbarWidth: "thin" }}
            >
              {drugDetail?.pharmacy_drugs &&
                drugDetail.pharmacy_drugs.length > 0 &&
                drugDetail?.pharmacy_drugs.map((pharmacyDrug, i) => (
                  <div
                    className="bg-zinc-100 p-[15px] flex flex-col gap-[25px] rounded-xl"
                    key={i}
                  >
                    <div className="flex flex-col gap-[3px]">
                      <h2 className="font-bold text-[16px] md:text-[18px] xl:text-[20px]">
                        {CurrencyFormatter.format(+pharmacyDrug.price)}
                      </h2>
                      <p className="text-[14px] md:text-[16px] xl:text-[17px]">
                        {pharmacyDrug.pharmacy.pharmacy_name}
                      </p>
                      {data ? (
                        <p className="flex h-[20px] gap-1 items-center text-[#788094] text-[14px] md:text-[16px] xl:text-[17px]">
                          <RiPinDistanceFill></RiPinDistanceFill>
                          {(pharmacyDrug.pharmacy.distance / 1000).toFixed(
                            2
                          )}{" "}
                          km from you
                        </p>
                      ) : (
                        <>
                          <div className="h-[20px]"></div>
                        </>
                      )}
                    </div>

                    {findQuantity(pharmacyDrug.id) > 0 && (
                      <div className="flex gap-4 items-center">
                        <button
                          type="button"
                          className="border-2 rounded-[50%] p-2 bg-white hover:scale-105 disabled:opacity-[0.3]"
                          onClick={() => handleSetItemQty(pharmacyDrug.id, -1)}
                          disabled={findQuantity(pharmacyDrug.id) <= 1}
                        >
                          <FaMinus />
                        </button>
                        <p className="text-[14px] md:text-[16px] xl:text-[18px]">
                          {findQuantity(pharmacyDrug.id)}
                        </p>
                        <button
                          type="button"
                          className="border-2 rounded-[50%] p-2  bg-white hover:scale-105 disabled:opacity-[0.3]"
                          onClick={() => handleSetItemQty(pharmacyDrug.id, 1)}
                          disabled={pharmacyDrug.stock < 1}
                        >
                          <FaPlus />
                        </button>
                      </div>
                    )}

                    {pharmacyDrug.stock < 1 ? (
                      <div className="flex items-center px-[15px]">
                        <p className="text-[#E01A52] text-[14px] md:text-[16px] xl:text-[18px] font-[600] h-fit">
                          Sold Out
                        </p>
                      </div>
                    ) : findQuantity(pharmacyDrug.id) <= 0 ? (
                      <button
                        onClick={() => {
                          if (!isTokenValid) {
                            HandleShowToast(
                              setToast,
                              false,
                              "Login to add product to your cart.",
                              7,
                              true
                            );
                            return;
                          }

                          addToCartHandler(pharmacyDrug.id, pharmacyDrug.price);
                        }}
                        className="flex gap-2 items-center bg-[#39da96] text-[14px] md:text-[16px] xl:text-[17px] rounded-xl hover:scale-105 text-white font-bold px-[1rem] py-[0.5rem] w-fit"
                      >
                        <FaPlus /> Add to cart
                      </button>
                    ) : (
                      <></>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      {drugDetail && (
        <ProductRelated
          isTokenValid={isTokenValid}
          categoryId={drugDetail.category.id}
          loc={getLoc()}
        />
      )}
    </>
  );
};

export default ProductDetail;
