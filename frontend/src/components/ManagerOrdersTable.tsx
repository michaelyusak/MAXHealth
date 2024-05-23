import React, { useContext } from "react";
import { IOrderPharmacy, OrderStatusMap } from "../interfaces/Order";
import { CurrencyFormatter } from "../util/CurrencyFormatter";
import { HandlePatchBodyRaw } from "../util/API";
import { ToastContext } from "../contexts/ToastData";
import { HandleShowToast } from "../util/ShowToast";
import { ManagerCancelOrderUrl, ManagerShipOrderUrl } from "../util/URL";
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";
import { useNavigate } from "react-router-dom";
import { FormatDateToYMDWithDay } from "../util/DateFormatter";

type managerOrdersTableProps = {
  orders: IOrderPharmacy[];
  refetchOrder: () => void;
  showAction?: boolean;
};

const ManagerOrdersTable = ({
  orders,
  refetchOrder,
  showAction,
}: managerOrdersTableProps): React.ReactElement => {
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
    <div className="p-[5px]">
      <table className="w-[100%] border-collapse">
        <thead className="border-b-2 border-slate-600">
          <tr>
            <th className="w-[40%]">Drug</th>
            <th className="w-[10%]">Total</th>
            <th className="w-[20%]">Shipment</th>
            <th className="w-[15%]">Status</th>
            {showAction !== undefined ||
              (!showAction && <th className="w-[15%]">Action</th>)}
          </tr>
        </thead>
        <tbody>
          {orders.map((order, i) => (
            <tr key={i}>
              <td colSpan={5}>
                <div className="w-[100%] my-[5px] bg-white rounded-[8px] p-[5px]">
                  <div className="w-[100%] flex justify-between border-b border-slate-600">
                    <div className="flex flex-row gap-[1rem]">
                      <p>
                        Order ID: <b>{order.order_pharmacy_id}</b>
                      </p>
                      <p>
                        Pharmacy: <b>{order.pharmacy_name}</b>
                      </p>
                    </div>

                    {order.updated_at && (
                      <p>
                        Updated at:{" "}
                        <b>{FormatDateToYMDWithDay(order.updated_at)}</b>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="flex flex-col gap-[10px] w-[40%]">
                      {order.order_items.map((orderItem, j) => (
                        <div key={j} className="flex gap-[10px] items-center">
                          <img
                            alt=""
                            src={orderItem.drug_image}
                            className="w-[200px]"
                          ></img>

                          <div className="flex flex-col">
                            <p>{orderItem.drug_name}</p>

                            <div className="flex gap-[2px]">
                              <p>
                                {CurrencyFormatter.format(orderItem.drug_price)}
                              </p>

                              <p>{orderItem.drug_unit.replace("per", "/")}</p>
                            </div>

                            <p>X {orderItem.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="w-[10%] text-center">
                      {CurrencyFormatter.format(order.subtotal_amount)}
                    </p>

                    <p className="w-[20%] text-center">{order.courier_name}</p>

                    <p className="w-[15%] text-center">
                      {OrderStatusMap[order.order_status_id]}
                    </p>

                    {order.order_status_id === 3 && (
                      <div className="w-[15%] flex flex-col justify-center gap-[10px] items-center">
                        <button
                          className="w-[60%] px-[10px] py-[5px] border-2 border-slate-400 rounded-[8px]"
                          onClick={() =>
                            handleShipOrder(order.order_pharmacy_id)
                          }
                        >
                          Ship
                        </button>
                        <button
                          className="w-[60%] px-[10px] py-[5px] border-2 border-slate-400 rounded-[8px]"
                          onClick={() =>
                            handleCancelOrder(order.order_pharmacy_id)
                          }
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManagerOrdersTable;
