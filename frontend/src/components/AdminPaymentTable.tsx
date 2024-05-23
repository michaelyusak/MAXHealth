import React, { useContext, useState } from "react";
import { IOrder, OrderStatusMap } from "../interfaces/Order";
import { CurrencyFormatter } from "../util/CurrencyFormatter";
import Modal from "./Modal";
import { HandlePatchBodyRaw } from "../util/API";
import { ToastContext } from "../contexts/ToastData";
import { HandleShowToast } from "../util/ShowToast";
import { AdminConfirmOrderPaymentUrl } from "../util/URL";
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";
import { useNavigate } from "react-router-dom";
import { FormatDateToYMDWithDay } from "../util/DateFormatter";

type AdminPaymentTableProps = {
  orders: IOrder[];
  refetchOrder: () => void;
};

const AdminPaymentTable = ({
  orders,
  refetchOrder,
}: AdminPaymentTableProps): React.ReactElement => {
  const navigate = useNavigate();

  const { setToast } = useContext(ToastContext);

  const [isShowImage, setIsShowImage] = useState(false);
  const [pictureModal, setPictureModal] = useState("");

  const handleShowImage = () => {
    setIsShowImage(!isShowImage);
  };

  const handleSetImage = (picture: string) => {
    setPictureModal(picture);
  };

  const handleConfirmOrder = (orderId: number, statusId: number) => {
    HandlePatchBodyRaw(
      JSON.stringify({
        status_id: statusId,
      }),
      AdminConfirmOrderPaymentUrl(orderId),
      true
    )
      .then(() => {
        HandleShowToast(
          setToast,
          true,
          statusId === 1 ? "Decline order success" : "Accept order success",
          5
        );
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
    <>
      {isShowImage && (
        <Modal picture={pictureModal} onClose={handleShowImage} />
      )}
      <div className="p-[5px]">
        <table className="w-[100%] border-collapse">
          <thead className="border-b-2 border-slate-600">
            <tr>
              <th className="w-[20%]">Payment</th>
              <th className="w-[15%]">Pharmacy Name</th>
              <th className="w-[10%]">Courier Name</th>
              <th className="w-[18%]">Courier Fee</th>
              <th className="w-[15%]">Subtotal Payment</th>
              <th className="w-[10%]">Order status</th>
              <th className="w-[20%]">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td colSpan={7}>
                  <div className="w-[100%] my-[5px] bg-white rounded-[8px] p-[5px]">
                    <div className="w-[100%] flex justify-between border-b border-slate-600">
                      <p>
                        Order ID: <b>{order.id}</b>
                      </p>
                      {order.updated_at && (
                        <p>
                          Updated at:{" "}
                          <b>{FormatDateToYMDWithDay(order.updated_at)}</b>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center w-[20%] py-4">
                        <button
                          onClick={() => {
                            handleShowImage();
                            handleSetImage(order.payment_proof);
                          }}
                        >
                          <img
                            alt=""
                            src={order.payment_proof}
                            className="w-[200px] h-[200px] object-cover"
                          ></img>
                        </button>
                      </div>
                      <div className="flex flex-col flex-1 justify-between py-6 ">
                        {order.pharmacies.map((pharmacy) => (
                          <div
                            key={pharmacy.order_pharmacy_id}
                            className="flex w-[100%] justify-between items-center border-y-2 border-gray-50 py-6"
                          >
                            <p className="w-[15%] text-center">
                              {pharmacy.pharmacy_name}
                            </p>
                            <p className="w-[10%] text-center">
                              {pharmacy.courier_name}
                            </p>
                            <p className="w-[15%] text-center">
                              {CurrencyFormatter.format(
                                Number(pharmacy.delivery_fee)
                              )}
                            </p>
                            <p className="w-[10%] text-center">
                              {CurrencyFormatter.format(
                                pharmacy.subtotal_amount
                              )}
                            </p>
                            <p className="w-[15%] text-center">
                              {OrderStatusMap[pharmacy.order_status_id]}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="w-[10%] flex flex-col justify-center gap-[10px] items-center px-4">
                        <button
                          className="hover:scale-105 hover:bg-gray-100 w-[100%] px-[10px] py-[5px] border-2 border-slate-400 rounded-[8px]"
                          onClick={() => handleConfirmOrder(order.id, 3)}
                        >
                          Accept
                        </button>
                        <button
                          className="hover:scale-105 hover:bg-gray-100 w-[100%] px-[10px] py-[5px] border-2 border-slate-400 rounded-[8px]"
                          onClick={() => handleConfirmOrder(order.id, 1)}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-end gap-5 mt-3">
                      <h3>Total payment: </h3>
                      <p>{CurrencyFormatter.format(order.total_amount)}</p>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AdminPaymentTable;
