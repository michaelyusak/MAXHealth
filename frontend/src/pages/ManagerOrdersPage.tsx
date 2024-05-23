import React, { useCallback, useContext, useEffect, useState } from "react";
import ManagerOrdersTable from "../components/ManagerOrdersTable";
import PaginationInfo from "../components/PaginationInfo";
import { HandleGet } from "../util/API";
import { ToastContext } from "../contexts/ToastData";
import { HandleShowToast } from "../util/ShowToast";
import {
  IOrderPharmacyListResponse,
  OrderStatusQueryMap,
  OrderStatusQueryReverseMap,
} from "../interfaces/Order";
import { ManagerOrderPharmaciesUrl } from "../util/URL";
import OrdersFilter from "../components/OrdersFilter";
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";
import { useNavigate, useSearchParams } from "react-router-dom";

const ManagerOrdersPage = (): React.ReactElement => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { setToast } = useContext(ToastContext);

  const [orderList, setOrderList] = useState<IOrderPharmacyListResponse>();

  const [selectedFilter, setSelectedFilter] = useState<{
    orderStatusId: number;
    page: number;
    orderId: number;
    pharmacyName: string;
    itemPerPage: number;
  }>({
    orderStatusId: 0,
    page: 1,
    orderId: 0,
    pharmacyName: "",
    itemPerPage: 10,
  });

  const handleFilterChange = (key: string, value: number | string) => {
    if (key === "orderStatusId" && OrderStatusQueryMap[Number(value)]) {
      setSearchParams({ status: OrderStatusQueryMap[Number(value)] });
    } else {
      setSearchParams((params) => {
        params.delete("status");
        return params;
      });
    }
    setSelectedFilter((prev) => {
      const updatedValue = {
        ...prev,
        [key]: value,
      };

      return updatedValue;
    });
  };

  const getOrders = useCallback(
    (orderStatusId?: number) => {
      HandleGet<IOrderPharmacyListResponse>(
        ManagerOrderPharmaciesUrl(
          orderStatusId ?? selectedFilter.orderStatusId,
          selectedFilter.pharmacyName,
          selectedFilter.page,
          selectedFilter.itemPerPage
        ),
        true
      )
        .then((responseData) => {
          setOrderList(responseData);
        })
        .catch((error: Error) => {
          if (error.message == MsgRefreshTokenNotFound) {
            navigate("/auth/login");
          }
          HandleShowToast(setToast, false, error.message, 5);
        });
    },
    [
      selectedFilter.orderStatusId,
      selectedFilter.pharmacyName,
      selectedFilter.page,
      selectedFilter.itemPerPage,
      setToast,
      navigate,
    ]
  );

  useEffect(() => {
    const orderStatus = searchParams.get("status");
    if (orderStatus && OrderStatusQueryReverseMap[orderStatus]) {
      const orderStatusId = OrderStatusQueryReverseMap[orderStatus];
      setSelectedFilter((prev) => {
        const updatedValue = {
          ...prev,
          orderStatusId: orderStatusId,
        };

        return updatedValue;
      });
      getOrders(orderStatusId);
      return;
    }
    setSearchParams((params) => {
      params.delete("status");
      return params;
    });
    getOrders();
  }, [searchParams, setSearchParams, getOrders]);

  return (
    <div className="w-[100%] flex flex-col gap-[20px] min-h-[calc(100vh-180px)]">
      <OrdersFilter
        initialSelectedOption={selectedFilter.orderStatusId}
        orderStatusFilterOptions={[
          {
            id: 0,
            name: "All",
          },
          {
            id: 1,
            name: "Awaiting Payment",
          },
          {
            id: 2,
            name: "Awaiting Approval",
          },
          {
            id: 3,
            name: "Pending",
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
        ]}
        onSelectOption={(orderStatusId) =>
          handleFilterChange("orderStatusId", orderStatusId)
        }
        onSearch={(pharmacyName) =>
          handleFilterChange("pharmacyName", pharmacyName)
        }
      />
      {orderList?.order_pharmacies ? (
        <>
          <ManagerOrdersTable
            orders={orderList.order_pharmacies}
            refetchOrder={getOrders}
            showAction={selectedFilter.orderStatusId === 3}
          />
          {orderList.order_pharmacies.length > 0 ? (
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
          ) : (
            <p className="text-center text-navy font-bold text-[17px]">
              No orders
            </p>
          )}
        </>
      ) : (
        <p className="text-center text-navy font-bold text-[17px]">No orders</p>
      )}
    </div>
  );
};

export default ManagerOrdersPage;
