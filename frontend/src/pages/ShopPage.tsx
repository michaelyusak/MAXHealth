import React, { useCallback, useContext, useEffect, useState } from "react";
import CardProduct from "../components/CardProduct";
import Filter from "../components/Filter";
import Cookies from "js-cookie";
import ItemSelector from "../components/ItemSelector";
import { Link } from "react-router-dom";
import PaginationInfo from "../components/PaginationInfo";
import { IDrugListResponse } from "../interfaces/Drug";
import { HandleGet } from "../util/API";
import { useAppDispatch, useAppSelector } from "../redux/reduxHooks";
import CardProductLoading from "../components/CardProductLoading";
import { jwtDecode } from "jwt-decode";
import { IToken } from "../interfaces/Token";
import { ToastContext } from "../contexts/ToastData";
import { HandleShowToast } from "../util/ShowToast";
import chevronRightIcon from "../assets/img/chevron-right-icon.png";
import chevronLeftIcon from "../assets/img/chevron-left-icon.png";
import { IAddress } from "../interfaces/Address";
import Dialog from "../components/Dialog";
import Button from "../components/Button";
import pinIcon from "../assets/img/pin-icon.png";
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";
import { updateAddress } from "../slices/OrderSlice";

const ShopPage = (): React.ReactElement => {
  const dispatch = useAppDispatch();
  const orderStateData = useAppSelector((state) => state.order);

  const { setToast } = useContext(ToastContext);

  const sortBys: string[] = [
    "Price - From low to high",
    "Price - From high to low",
  ];

  const initialCategory = useAppSelector(
    (state) => state.initialCategory.category
  );

  const [drugList, setDrugList] = useState<IDrugListResponse>();

  const [sortBy, setSortBy] = useState<string>("Price - From low to high");
  const [page, setPage] = useState<number>(1);
  const [itemPerPage, setItemPerPage] = useState<number>(12);

  const [categoryId, setCategoryId] = useState<string>(initialCategory);

  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);

  const [selectedAddress, setSelectedAddress] = useState<IAddress | undefined>(
    orderStateData.address &&
      orderStateData.address.id &&
      orderStateData.address.id > 0
      ? orderStateData.address
      : undefined
  );
  const [searchDrugs, setSearchDrugs] = useState<string>("");

  const onHandleSearch = (searchParams: string) => {
    setSearchDrugs(searchParams);
  };

  const fetchDrugList = useCallback(
    (latitude: string, longitude: string) => {
      let sortByCol = "";
      let sortByOrd = "";

      if (sortBy.includes(" - ")) {
        const sortByParams = sortBy.split(" - ");

        sortByCol = sortByParams[0].toLowerCase();
        sortByOrd = sortByParams[1].toLowerCase();
      }

      const url =
        import.meta.env.VITE_DEPLOYMENT_URL +
        `/drugs?lat=${latitude}&long=${longitude}&search=${searchDrugs}&${
          sortByCol != "" ? `sort-by=${sortByCol}&` : ""
        }${
          sortByOrd != ""
            ? `sort=${sortByOrd == "from low to high" ? "asc" : "desc"}&`
            : ""
        }${
          categoryId == "" ? "" : `category=${categoryId}&`
        }min-price=${minPrice}&${
          maxPrice > minPrice ? `max-price=${maxPrice}&` : ""
        }limit=${itemPerPage}&page=${page}`;

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      setDrugList(undefined);

      setIsLoading(true);
      HandleGet<IDrugListResponse>(url)
        .then((responseData) => {
          setDrugList(responseData);
        })
        .catch((error: Error) => {
          HandleShowToast(setToast, false, error.message, 5);
        })
        .finally(() => setIsLoading(false));
    },
    [
      categoryId,
      itemPerPage,
      maxPrice,
      minPrice,
      page,
      setToast,
      sortBy,
      searchDrugs,
    ]
  );

  const getAddress = useCallback(async () => {
    const url = import.meta.env.VITE_DEPLOYMENT_URL + "/address";

    setIsLoading(true);
    HandleGet<{ address: IAddress[] }>(url, true)
      .then((responseData) => {
        setAddressOptions(responseData.address);

        if (responseData.address.length > 0) {
          let mainAddress: IAddress | undefined = undefined;
          responseData.address.forEach((address) => {
            if (address.is_main) {
              mainAddress = address;
            }
          });

          if (!mainAddress) {
            mainAddress = responseData.address[0];
          }

          if (
            !selectedAddress ||
            (selectedAddress && selectedAddress.id === 0)
          ) {
            setSelectedAddress(mainAddress);
            dispatch(updateAddress(mainAddress));
          }
        }
      })
      .catch((error: Error) => {
        if (error.message != MsgRefreshTokenNotFound) {
          HandleShowToast(setToast, false, error.message, 5);
        }
      })
      .finally(() => setIsLoading(false));
  }, [setToast, dispatch, selectedAddress]);

  const getLocation = useCallback(
    async (data: string) => {
      const dataParsed = JSON.parse(data);
      const mainLocation: { lat: string; long: string } =
        dataParsed["location"];

      await getAddress();

      if (
        selectedAddress &&
        selectedAddress.latitude &&
        selectedAddress.longitude
      ) {
        fetchDrugList(selectedAddress.latitude, selectedAddress.longitude);
        return;
      }

      if (mainLocation.lat !== "" && mainLocation.long !== "") {
        fetchDrugList(mainLocation.lat, mainLocation.long);
        return;
      }
    },
    [fetchDrugList, selectedAddress, getAddress]
  );

  useEffect(() => {
    const data = Cookies.get("data");

    if (data) {
      getLocation(data);
    }

    fetchDrugList("-6.1934332", "106.8217253")
  }, [fetchDrugList, selectedAddress, getLocation]);

  const token = Cookies.get("accessToken");

  const [isTokenValid, setIsTokenValid] = useState<boolean>(false);

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

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, []);

  return (
    <>
      {isLoading && (
        <div className="fixed z-10 w-full h-[100vh] top-0 left-0 right-0 bottom-0 bg-[rgba(128,128,128,0.4)]" />
      )}
      <div className="md:flex-row flex flex-col gap-4">
        <Filter
          onSearch={onHandleSearch}
          initialCategoryId={initialCategory}
          onSelectCategory={(id) => {
            setPage(1);
            id == 0 ? setCategoryId("") : setCategoryId(id.toString());
          }}
          onApplyPrice={(minPrice, maxPrice) => {
            setMinPrice(minPrice);
            setMaxPrice(maxPrice);
          }}
        />
        <div className="w-[100%] md:w-[80%] flex flex-col gap-[20px] min-h-[1250px]">
          <div className="flex flex-col md:flex-row h-[auto] md:h-[120px] justify-between bg-slate-100 rounded-md p-4 items-center">
            {token && (
              <div
                className="flex flex-row gap-[0.75rem] justify-between items-center border-[1px] p-4 w-[100%] md:w-[40%] cursor-pointer"
                onClick={() => {
                  setShowAddressOptions(true);
                  if (selectedAddress)
                    setSelectedAddressOption(selectedAddress);
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
                    <p className="line-clamp-2">{selectedAddress.address}</p>
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
            <p>
              Showing {itemPerPage} of {drugList?.page_info.item_count} results
            </p>
            <ItemSelector
              items={sortBys}
              placeholder=""
              value={sortBy}
              setValue={(value) => setSortBy(value)}
              buttonAdditionalClassname="w-[220px] md:z-50"
              optionsAdditionalClassname="top-[40px] z-50"
              height="h-[50px]"
            ></ItemSelector>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,_minmax(180px,_1fr))] md:grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))] xl:grid-cols-[repeat(auto-fill,_minmax(240px,_1fr))] md:min-h-[650px] gap-x-[5px] gap-y-[10px] place-content-start justify-items-center md:justify-items-start">
            {drugList ? (
              drugList.drug_list.map((pharmacyDrug) => (
                <Link
                  key={pharmacyDrug.pharmacy_drug_id}
                  to={`/product/${pharmacyDrug.drug_id}`}
                >
                  <CardProduct
                    showAddToCartButton={isTokenValid}
                    pharmacyDrug={pharmacyDrug}
                  ></CardProduct>
                </Link>
              ))
            ) : (
              <CardProductLoading itemCount={12}></CardProductLoading>
            )}
          </div>

          <PaginationInfo
            totalPage={drugList?.page_info.page_count ?? 1}
            activePage={page}
            setPage={(value) => setPage(value)}
            minItemPerPage={4}
            maxItemPerPage={40}
            stepItemPerPage={4}
            itemPerPage={itemPerPage}
            setItemPerPage={(value) => setItemPerPage(+value)}
            withItemPerPage={true}
          ></PaginationInfo>
        </div>
      </div>
      {showAddressOptions && (
        <Dialog
          cardWidth="w-[90%] md:w-[700px]"
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
                        selectedAddressOption &&
                        selectedAddressOption.id === address.id
                          ? "border-brightBlue"
                          : "border-[#7b7c7c]"
                      } rounded-full`}
                    >
                      <div
                        className={`h-[11px] w-[11px] ${
                          selectedAddressOption &&
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
                additionalClassName="py-2 rounded-[20px]"
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
    </>
  );
};

export default ShopPage;
