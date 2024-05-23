import React, { useCallback, useContext, useEffect, useState } from "react";
import AdminPaymentTable from "../components/AdminPaymentTable";
import { IOrderListResponse } from "../interfaces/Order";
import { HandleGet } from "../util/API";
import { ToastContext } from "../contexts/ToastData";
import { HandleShowToast } from "../util/ShowToast";
import { AdminOrdersUrl } from "../util/URL";
import PaginationInfo from "../components/PaginationInfo";
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";
import { useNavigate } from "react-router-dom";

const AdminPaymentProofPage = (): React.ReactElement => {
  const navigate = useNavigate();

  const { setToast } = useContext(ToastContext);

  const [orderList, setOrderList] = useState<IOrderListResponse>();

  const [selectedFilter, setSelectedFilter] = useState<{
    page: number;
    pharmacyName: string;
    itemPerPage: number;
  }>({
    page: 1,
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

  const getOrders = useCallback(() => {
    HandleGet<IOrderListResponse>(
      AdminOrdersUrl(2, selectedFilter.page, selectedFilter.itemPerPage),
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
  }, [selectedFilter.page, selectedFilter.itemPerPage, setToast, navigate]);

  useEffect(() => {
    getOrders();
  }, [getOrders]);

  return (
    <div className=" min-h-[calc(100vh-180px)]">
      {orderList && (
        <>
          <AdminPaymentTable
            orders={orderList.orders}
            refetchOrder={getOrders}
          />
          {orderList.orders.length > 0 ? (
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
      )}
    </div>
  );
};

export default AdminPaymentProofPage;
