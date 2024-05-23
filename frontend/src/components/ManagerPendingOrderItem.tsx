import React, { useContext } from "react";
import { IOrderPharmacy } from "../interfaces/Order";
import { CurrencyFormatter } from "../util/CurrencyFormatter";
import { FormatDateToYMDWithDay } from "../util/DateFormatter";
import { HandlePatchBodyRaw } from "../util/API";
import { ManagerCancelOrderUrl, ManagerShipOrderUrl } from "../util/URL";
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";
import { useNavigate } from "react-router-dom";
import { ToastContext } from "../contexts/ToastData";
import { HandleShowToast } from "../util/ShowToast";

type managerPendingOrderItemProps = {
  order: IOrderPharmacy;
  refetchOrder: () => void;
};

const ManagerPendingOrderItem = ({
  order,
  refetchOrder,
}: managerPendingOrderItemProps): React.ReactElement => {
  const navigate = useNavigate();
  const { setToast } = useContext(ToastContext);

  const handleShipOrder = (orderPharmacyId: number) => {
    HandlePatchBodyRaw("", ManagerShipOrderUrl(orderPharmacyId), true)
      .then(() => {
        HandleShowToast(setToast, true, "Ship order success", 5);
        refetchOrder();
      })
      .catch((error: Error) => {
        if (error.message == MsgRefreshTokenNotFound) {
          navigate("/auth/login");
        }
        HandleShowToast(setToast, false, error.message, 5);
      });
  };

  const handleCancelOrder = (orderPharmacyId: number) => {
    HandlePatchBodyRaw("", ManagerCancelOrderUrl(orderPharmacyId), true)
      .then(() => {
        HandleShowToast(setToast, true, "Cancel order success", 5);
        refetchOrder();
      })
      .catch((error: Error) => {
        if (error.message == MsgRefreshTokenNotFound) {
          navigate("/auth/login");
        }
        HandleShowToast(setToast, false, error.message, 5);
      });
  };

  return (
    <div className="bg-[#DFF1FD] rounded-[8px] flex flex-col p-[5px]">
      <div className="flex justify-between border-b-2 border-[#000D44]">
        <div className="flex flex-row gap-[1rem]">
          <p>
            Order ID: <b>{order.order_pharmacy_id}</b>
          </p>
          <p>
            Pharmacy: <b>{order.pharmacy_name}</b>
          </p>
        </div>
        {order.created_at && (
          <p>Created at: {FormatDateToYMDWithDay(order.created_at)}</p>
        )}
      </div>
      <div className="flex items-center justify-between gap-[30px] p-[5px]">
        <div className="flex flex-col gap-[10px] w-[45%]">
          {order.order_items.map((orderItem) => (
            <div key={orderItem.id} className="flex items-center gap-[10px]">
              <img
                alt=""
                src={`${orderItem.drug_image}`}
                className="h-[100px] w-[100px] rounded-[8px]"
              ></img>
              <div className="flex flex-col">
                <p>{orderItem.drug_name}</p>
                <p>
                  {CurrencyFormatter.format(orderItem.drug_price)}{" "}
                  {orderItem.drug_unit.replace("per", "/")}
                </p>
                <p>
                  <b className="text-[#1F5FFF] text-[14px]">X</b>{" "}
                  {orderItem.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[18px] font-[600]">
          {CurrencyFormatter.format(order.subtotal_amount)}
        </p>
        <div className="flex flex-col gap-[1rem]">
          <button
            className="py-[5px] px-[5px] flex justify-center items-center bg-[#D3FEEB] border-2 border-[#14C57B] rounded-[8px]"
            onClick={() => handleShipOrder(order.order_pharmacy_id)}
          >
            Send Order
          </button>
          <button
            className="py-[5px] px-[5px] flex justify-center items-center bg-[#fee1d3] border-2 border-[#c54c14] rounded-[8px]"
            onClick={() => handleCancelOrder(order.order_pharmacy_id)}
          >
            Cancel Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerPendingOrderItem;
