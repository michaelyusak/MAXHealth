import React, { useCallback, useContext, useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import { CurrencyFormatter } from "../util/CurrencyFormatter";
import { path } from "../router/path";
import chevronRightIcon from "../assets/img/chevron-right-icon.png";
import {
  IOrderListResponse,
  IOrderPharmacyListResponse,
  OrderStatusMap,
} from "../interfaces/Order";
import { HandleGet, HandlePatchBodyRaw } from "../util/API";
import { ToastContext } from "../contexts/ToastData";
import { HandleShowToast } from "../util/ShowToast";
import Button from "../components/Button";
import Dialog from "../components/Dialog";
import ConfirmationDialog from "../components/ConfirmationDialog";
import PaginationInfo from "../components/PaginationInfo";
import {
  UserOrderPharmaciesUrl,
  UserPendingOrdersUrl,
  UserReceiveOrderUrl,
} from "../util/URL";
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";

const UserOrdersPage = (): React.ReactElement => {
  const navigate = useNavigate();

  const orderStatusFilterOptions = [
    {
      id: 1,
      name: "Awaiting Payment",
    },
    {
      id: 2,
      name: "Awaiting Payment Confirmation",
    },
    {
      id: 3,
      name: "Processed",
    },
    {
      id: 4,
      name: "Sent",
    },
    {
      id: 5,
      name: "Confirmed",
    },
    {
      id: 6,
      name: "Canceled",
    },
  ];

  const { setToast } = useContext(ToastContext);

  const [selectedFilter, setSelectedFilter] = useState<{
    orderStatusId: number;
    page: number;
    orderId: number;
    itemPerPage: number;
  }>({
    orderStatusId: 1,
    page: 1,
    orderId: 0,
    itemPerPage: 10,
  });

  const [orderList, setOrderList] = useState<IOrderListResponse>();
  const [orderPharmacies, setOrderPharmacies] =
    useState<IOrderPharmacyListResponse>();
  const [showReceiveConfirmation, setShowReceiveConfirmation] =
    useState<boolean>(false);

  const calculateTotal = (subtotal: number, deliveryFee: number): number =>
    subtotal + deliveryFee;

  const handleFilterChange = (key: string, value: number) => {
    setSelectedFilter((prev) => {
      const updatedValue = {
        ...prev,
        [key]: value,
      };

      return updatedValue;
    });
  };

  const handleReceiveOrder = () => {
    HandlePatchBodyRaw("", UserReceiveOrderUrl(selectedFilter.orderId), true)
      .then(() => {
        HandleShowToast(setToast, true, "Receive order success", 5);
        getOrders();
        setShowReceiveConfirmation(false);
      })
      .catch((error: Error) => {
        setShowReceiveConfirmation(false);
        if (error.message == MsgRefreshTokenNotFound) {
          navigate("/auth/login");
        }
        HandleShowToast(setToast, false, error.message, 5);
      });
  };

  const getOrders = useCallback(() => {
    if (selectedFilter.orderStatusId) {
      if (selectedFilter.orderStatusId === 1) {
        HandleGet<IOrderListResponse>(
          UserPendingOrdersUrl(selectedFilter.page, selectedFilter.itemPerPage),
          true
        )
          .then((responseData) => {
            setOrderList(responseData);
            setOrderPharmacies(undefined);
          })
          .catch((error: Error) => {
            if (error.message == MsgRefreshTokenNotFound) {
              navigate("/auth/login");
            }
            HandleShowToast(setToast, false, error.message, 5, true);
          });
      } else {
        HandleGet<IOrderPharmacyListResponse>(
          UserOrderPharmaciesUrl(
            selectedFilter.orderStatusId,
            selectedFilter.page,
            selectedFilter.itemPerPage
          ),
          true
        )
          .then((responseData) => {
            setOrderPharmacies(responseData);
            setOrderList(undefined);
          })
          .catch((error: Error) => {
            if (error.message == MsgRefreshTokenNotFound) {
              navigate("/auth/login");
            }
            HandleShowToast(setToast, false, error.message, 5);
          });
      }
    }
  }, [
    selectedFilter.orderStatusId,
    selectedFilter.page,
    selectedFilter.itemPerPage,
    setToast,
    navigate,
  ]);

  useEffect(() => {
    getOrders();
  }, [getOrders]);

  return (
    <div className="min-h-[calc(100vh-500px)] flex flex-col gap-[2rem] ">
      <div className="flex md:flex-row md:bg-lightGrey bg-gray-200 md:p-[2rem] md:rounded-[20px] md:gap-[2rem] w-[100%] md:w-[auto] flex-wrap gap-1 py-2">
        {orderStatusFilterOptions.map((status, i) => (
          <div
            key={i}
            className={`md:px-[1.5rem] py-2 px-3 md:py-[0.75rem] uppercase cursor-pointer md:text-[18px] text-[14px] ${
              selectedFilter.orderStatusId === status.id
                ? "bg-navy text-white"
                : "bg-white"
            }  md:rounded-3xl rounded-[20px] hover:translate-y-px hover:translate-x-px`}
            onClick={() => handleFilterChange("orderStatusId", status.id)}
          >
            {status.name}
          </div>
        ))}
      </div>
      {selectedFilter.orderStatusId === 1 &&
      orderList?.orders &&
      orderList?.orders.length > 0 ? (
        <>
          {orderList?.orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col gap-[1rem] bg-white p-2 md:p-[2rem] rounded-[20px] border-[1px] mx-2 md:mx-0"
            >
              <div className="flex flex-row justify-between">
                <p className="text-navy font-bold text-lg">
                  Order ID: {order.id}
                </p>
                <Button
                  type="button"
                  buttonStyle="green"
                  additionalClassName="w-fit py-2 px-3 rounded-lg text-[14px]"
                  onClick={() => navigate(`${path.orders}/payment/${order.id}`)}
                >
                  Pay
                </Button>
              </div>
              {order.pharmacies.map((orderPharmacy) => (
                <div
                  key={orderPharmacy.order_pharmacy_id}
                  className="flex flex-row justify-between items-center cursor-pointer hover:translate-y-px hover:translate-x-px gap-2"
                  onClick={() =>
                    navigate(
                      `${path.orders}/${orderPharmacy.order_pharmacy_id}`
                    )
                  }
                >
                  <div className="w-[40%] flex flex-row items-center gap-[1rem]">
                    <img
                      className="w-[50px] h-[50px] object-cover rounded-full hidden md:block"
                      src={orderPharmacy.profile_picture}
                      alt=""
                    />
                    <p className="text-navy font-bold text-lg text-[13px] md:text-[18px]">
                      {orderPharmacy.pharmacy_name}
                    </p>
                  </div>
                  <div className="flex flex-row items-center md:gap-[1rem] gap-1">
                    <p className="text-gray-400 md:text-black">
                      {orderPharmacy.order_items_count} product
                      {orderPharmacy.order_items_count &&
                        orderPharmacy.order_items_count > 1 &&
                        "s"}
                    </p>
                    <p>
                      {CurrencyFormatter.format(
                        calculateTotal(
                          Number(orderPharmacy.subtotal_amount),
                          Number(orderPharmacy.delivery_fee)
                        )
                      )}
                    </p>
                    <img
                      className="w-[20px] md:w-[30px]"
                      alt=""
                      src={chevronRightIcon}
                    />
                  </div>
                </div>
              ))}
              <div className="flex flex-row justify-end items-center text-lg">
                <p>
                  Total: {CurrencyFormatter.format(Number(order.total_amount))}
                </p>
              </div>
            </div>
          ))}
          <PaginationInfo
            totalPage={orderList?.page_info.page_count ?? 1}
            activePage={selectedFilter.page}
            setPage={(value) => handleFilterChange("page", value)}
            minItemPerPage={1}
            maxItemPerPage={10}
            stepItemPerPage={1}
            itemPerPage={selectedFilter.itemPerPage}
            setItemPerPage={(value) =>
              handleFilterChange("itemPerPage", +value)
            }
            withItemPerPage={true}
          />
        </>
      ) : selectedFilter.orderStatusId === 1 &&
        (!orderList?.orders ||
          (orderList?.orders && orderList?.orders.length === 0)) ? (
        <div className="h-[60vh]">
          <p className="text-center text-navy font-bold text-[17px]">
            No orders
          </p>
        </div>
      ) : (
        <></>
      )}
      {selectedFilter.orderStatusId > 1 &&
      orderPharmacies?.order_pharmacies &&
      orderPharmacies.order_pharmacies.length > 0 ? (
        <>
          {orderPharmacies.order_pharmacies.map((orderPharmacy) => (
            <div
              key={orderPharmacy.order_pharmacy_id}
              className="flex flex-col gap-[1rem] bg-white p-2 md:p-[2rem] rounded-[20px] cursor-pointer border-[1px] hover:shadow-[1px_1px_10px_10px_rgba(0,0,0,0.01)] hover:translate-y-px hover:translate-x-px"
              onClick={() =>
                navigate(`${path.orders}/${orderPharmacy.order_pharmacy_id}`)
              }
            >
              <div className="flex flex-row justify-between items-center pb-[1rem] border-b-[1px]">
                <div className="flex flex-row gap-[1rem] items-center">
                  <img
                    className="hidden md:block w-[50px] h-[50px] object-cover rounded-full"
                    src={orderPharmacy.profile_picture}
                    alt=""
                  />
                  <p className="text-navy font-bold text-lg">
                    {orderPharmacy.pharmacy_name}
                  </p>
                </div>
                {orderPharmacy.order_status_id !== 4 ? (
                  <p className="text-brightBlue">
                    {OrderStatusMap[orderPharmacy.order_status_id]}
                  </p>
                ) : (
                  <Button
                    type="button"
                    buttonStyle="green"
                    additionalClassName="w-fit"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFilterChange(
                        "orderId",
                        orderPharmacy.order_pharmacy_id
                      );
                      setShowReceiveConfirmation(true);
                    }}
                  >
                    Receive
                  </Button>
                )}
              </div>
              <table className="w-[100%]">
                <tbody>
                  <tr className="flex justify-between items-center">
                    <td>
                      <div className="flex justify-center">
                        <img
                          className="w-[100px] object-contain"
                          src={orderPharmacy.first_order_item?.drug_image ?? ""}
                          alt=""
                        />
                      </div>
                    </td>
                    <td>
                      <div className="text-[#7b7c7c] md:text-lg text-sm">
                        {orderPharmacy.first_order_item?.drug_name}
                      </div>
                    </td>
                    <td>
                      <div className="text-center text-[#7b7c7c] text-sm md:text-lg mr-1">
                        x{orderPharmacy.first_order_item?.quantity}
                      </div>
                    </td>
                    <td>
                      <div className="text-center text-[#7b7c7c] text-sm md:text-lg">
                        {CurrencyFormatter.format(
                          orderPharmacy.first_order_item?.drug_price ?? 0
                        )}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="flex flex-row justify-between items-center text-lg">
                <p>
                  {orderPharmacy.order_items_count} product
                  {orderPharmacy.order_items_count &&
                    orderPharmacy.order_items_count > 1 &&
                    "s"}
                </p>

                <p>
                  Total:{" "}
                  {CurrencyFormatter.format(orderPharmacy.subtotal_amount)}
                </p>
              </div>
            </div>
          ))}
          <PaginationInfo
            totalPage={orderPharmacies?.page_info.page_count ?? 1}
            activePage={selectedFilter.page}
            setPage={(value) => handleFilterChange("page", value)}
            minItemPerPage={1}
            maxItemPerPage={10}
            stepItemPerPage={1}
            itemPerPage={selectedFilter.itemPerPage}
            setItemPerPage={(value) =>
              handleFilterChange("itemPerPage", +value)
            }
            withItemPerPage={true}
          />
        </>
      ) : selectedFilter.orderStatusId > 1 &&
        (!orderPharmacies?.order_pharmacies ||
          (orderPharmacies.order_pharmacies &&
            orderPharmacies.order_pharmacies.length === 0)) ? (
              <div className="h-[60vh] flex items-center justify-center">
              <p className="text-center text-navy font-bold text-[17px]">
                No orders
              </p>
            </div>
      ) : (
        <></>
      )}
      {showReceiveConfirmation && (
        <Dialog
          content={
            <ConfirmationDialog
              text="Are you sure you want to complete this order?"
              rightButton={{
                text: "Yes",
                style: "blue",
                onClick: handleReceiveOrder,
              }}
              leftButton={{
                text: "No",
                style: "blue",
                onClick: () => setShowReceiveConfirmation(false),
              }}
            />
          }
          onClose={() => {
            setShowReceiveConfirmation(false);
          }}
        />
      )}
    </div>
  );
};

export default UserOrdersPage;
