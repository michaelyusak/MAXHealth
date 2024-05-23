import React, { useCallback, useContext, useEffect, useState } from "react";
import { IOrderPharmacyListResponse } from "../interfaces/Order";
import { HandleGet } from "../util/API";
import { ToastContext } from "../contexts/ToastData";
import { HandleShowToast } from "../util/ShowToast";
import { AdminOrderPharmaciesUrl } from "../util/URL";
import PaginationInfo from "../components/PaginationInfo";
import AdminOrdersTable from "../components/AdminOrdersTable";
import OrdersFilter from "../components/OrdersFilter";
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";
import { useNavigate } from "react-router-dom";

const AdminOrdersPage = (): React.ReactElement => {
  const navigate = useNavigate();

  const { setToast } = useContext(ToastContext);

  const [orderPharmacyList, setOrderPharmacyList] =
    useState<IOrderPharmacyListResponse>();

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
    setSelectedFilter((prev) => {
      const updatedValue = {
        ...prev,
        [key]: value,
      };

      return updatedValue;
    });
  };

  const getOrderPharmacies = useCallback(() => {
    HandleGet<IOrderPharmacyListResponse>(
      AdminOrderPharmaciesUrl(
        selectedFilter.orderStatusId,
        selectedFilter.pharmacyName,
        selectedFilter.page,
        selectedFilter.itemPerPage
      ),
      true
    )
      .then((responseData) => {
        setOrderPharmacyList(responseData);
      })
      .catch((error: Error) => {
        if (error.message == MsgRefreshTokenNotFound) {
          navigate("/auth/login");
        }
        HandleShowToast(setToast, false, error.message, 5);
      });
  }, [
    selectedFilter.orderStatusId,
    selectedFilter.pharmacyName,
    selectedFilter.page,
    selectedFilter.itemPerPage,
    setToast,
    navigate,
  ]);

  useEffect(() => {
    getOrderPharmacies();
  }, [getOrderPharmacies]);

  return (
    <div className=" min-h-[calc(100vh-180px)]">
      <OrdersFilter
        initialSelectedOption={0}
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
        ]}
        onSelectOption={(orderStatusId) =>
          handleFilterChange("orderStatusId", orderStatusId)
        }
        onSearch={(pharmacyName) =>
          handleFilterChange("pharmacyName", pharmacyName)
        }
      />
      {orderPharmacyList?.order_pharmacies &&
      orderPharmacyList.order_pharmacies.length > 0 ? (
        <>
          <AdminOrdersTable orders={orderPharmacyList.order_pharmacies} />
          <PaginationInfo
            totalPage={orderPharmacyList?.page_info.page_count ?? 1}
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
      ) : (
        <p className="text-center text-navy font-bold text-[17px]">No orders</p>
      )}
    </div>
  );
};

export default AdminOrdersPage;
