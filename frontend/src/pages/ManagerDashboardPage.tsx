import React, { useCallback, useContext, useEffect, useState } from "react";
import ManagerBusinessSummary from "../components/ManagerBusinessSummary";
import { IBusinessSummaryItem } from "../interfaces/BusinessSummaryItem";
import ManagerPendingOrder from "../components/ManagerPendingOrder";
import { IOrderPharmacyListResponse } from "../interfaces/Order";
import { HandleGet } from "../util/API";
import { ManagerOrderPharmaciesUrl, URL } from "../util/URL";
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";
import { useNavigate } from "react-router-dom";
import { ToastContext } from "../contexts/ToastData";
import { HandleShowToast } from "../util/ShowToast";

const ManagerDashboardPage = (): React.ReactElement => {
  const navigate = useNavigate();
  const { setToast } = useContext(ToastContext);

  const [pendingOrderList, setPendingOrderList] =
    useState<IOrderPharmacyListResponse>();
  const [orderSummary, setOrderSummary] = useState<IBusinessSummaryItem[]>();

  const getPendingOrders = useCallback(() => {
    HandleGet<IOrderPharmacyListResponse>(
      ManagerOrderPharmaciesUrl(3, "", 0, 0),
      true
    )
      .then((responseData) => {
        setPendingOrderList(responseData);
      })
      .catch((error: Error) => {
        if (error.message == MsgRefreshTokenNotFound) {
          navigate("/auth/login");
        }
        HandleShowToast(setToast, false, error.message, 5);
      });
  }, [setToast, navigate]);

  const getOrderSummary = useCallback(() => {
    HandleGet<{
      all_count: number;
      unpaid_count: number;
      approval_count: number;
      pending_count: number;
      sent_count: number;
      confirmed_count: number;
      canceled_count: number;
    }>(URL.ManagerOrderPharmacySummaryUrl, true)
      .then((responseData) => {
        setOrderSummary([
          {
            category: "All Order",
            value: responseData.all_count,
            onClick: () => navigate("/manager/orders"),
          },
          {
            category: "Awaiting Payment Order",
            value: responseData.unpaid_count,
            onClick: () => navigate("/manager/orders?status=unpaid"),
          },
          {
            category: "Awaiting Approval Order",
            value: responseData.approval_count,
            onClick: () => navigate("/manager/orders?status=approval"),
          },
          {
            category: "Pending Order",
            value: responseData.pending_count,
            onClick: () => navigate("/manager/orders?status=pending"),
          },
          {
            category: "Sent Order",
            value: responseData.sent_count,
            onClick: () => navigate("/manager/orders?status=sent"),
          },
          {
            category: "Confirmed Order",
            value: responseData.confirmed_count,
            onClick: () => navigate("/manager/orders?status=confirmed"),
          },
          {
            category: "Canceled Order",
            value: responseData.canceled_count,
            onClick: () => {
              navigate("/manager/orders?status=canceled");
            },
          },
        ]);
      })
      .catch((error: Error) => {
        if (error.message == MsgRefreshTokenNotFound) {
          navigate("/auth/login");
        }
        HandleShowToast(setToast, false, error.message, 5);
      });
  }, [setToast, navigate]);

  useEffect(() => {
    getPendingOrders();
    getOrderSummary();
  }, [getPendingOrders, getOrderSummary]);

  return (
    <div className="flex flex-col gap-[15px] min-h-[calc(100vh-180px)]">
      {orderSummary && (
        <ManagerBusinessSummary
          businessSumarryItems={orderSummary}
        ></ManagerBusinessSummary>
      )}
      <div className="flex justify-between h-[700px]">
        {pendingOrderList?.order_pharmacies && (
          <ManagerPendingOrder
            pendingOrders={pendingOrderList?.order_pharmacies}
            refetchOrder={() => {
              getOrderSummary();
              getPendingOrders();
            }}
          ></ManagerPendingOrder>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboardPage;
