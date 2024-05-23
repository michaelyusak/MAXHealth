import React from "react";

import { FaWhatsapp, FaEnvelope } from "react-icons/fa";

import { IOrderPharmacy, OrderStatusMap } from "../interfaces/Order";
import { CurrencyFormatter } from "../util/CurrencyFormatter";
import { FormatDateToYMDWithDay } from "../util/DateFormatter";

type AdminOrdersTableProps = {
  orders: IOrderPharmacy[];
};

const AdminOrdersTable = ({
  orders,
}: AdminOrdersTableProps): React.ReactElement => {
  return (
    <div className="p-[5px]">
      <table className="w-[100%] border-collapse">
        <thead className="border-b-2 border-slate-600">
          <tr>
            <th className="w-[40%]">Drug</th>
            <th className="w-[10%]">Total</th>
            <th className="w-[20%]">Shipment</th>
            <th className="w-[15%]">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.order_pharmacy_id}>
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
                      <a
                        href={`https://api.whatsapp.com/send?phone=${order.pharmacist_phone_number}`}
                        target="_blank"
                        className="flex flex-row justify-center items-center"
                      >
                        <FaWhatsapp />
                      </a>
                      <a
                        href={`mailto:${order.pharmacy_manager_email}?subject=Max Health Order Pharmacy Number ${order.order_pharmacy_id}`}
                        className="flex flex-row justify-center items-center"
                      >
                        <FaEnvelope />
                      </a>
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
                      {order.order_items.map((orderItem) => (
                        <div
                          key={orderItem.id}
                          className="flex gap-[10px] items-center"
                        >
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

export default AdminOrdersTable;
