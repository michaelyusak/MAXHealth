import React, { useCallback, useContext, useEffect, useState } from "react";

import chevronLeftIcon from "../assets/img/chevron-left-icon.png";
import pinIcon from "../assets/img/pin-icon.png";
import Button from "../components/Button";
import Dialog from "../components/Dialog";
import ConfirmationDialog from "../components/ConfirmationDialog";
import { useNavigate, useParams } from "react-router-dom";
import { HandleGet, HandlePatchBodyRaw } from "../util/API";
import { ToastContext } from "../contexts/ToastData";
import { HandleShowToast } from "../util/ShowToast";
import { IOrderPharmacy, OrderStatusMap } from "../interfaces/Order";
import OrderPharmacyTable from "../components/OrderPharmacyTable";
import { OrderPharmacyDetailUrl, UserReceiveOrderUrl } from "../util/URL";
import { FormatDateToYMDWithDay } from "../util/DateFormatter";
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";

const UserOrderPharmacyDetailPage = (): React.ReactElement => {
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();

  const { setToast } = useContext(ToastContext);

  const [orderPharmacyDetail, setOrderPharmacyDetail] =
    useState<IOrderPharmacy>();
  const [showReceiveConfirmation, setShowReceiveConfirmation] =
    useState<boolean>(false);

  const getOrderPharmacyDetail = useCallback(() => {
    if (id)
      HandleGet<IOrderPharmacy>(OrderPharmacyDetailUrl(id), true)
        .then((responseData) => {
          setOrderPharmacyDetail(responseData);
        })
        .catch((error: Error) => {
          if (error.message == MsgRefreshTokenNotFound) {
            navigate("/auth/login");
          }
          HandleShowToast(setToast, false, error.message, 5);
        });
  }, [id, setToast, navigate]);

  useEffect(() => {
    getOrderPharmacyDetail();
  }, [getOrderPharmacyDetail]);

  const handleReceiveOrder = () => {
    HandlePatchBodyRaw("", UserReceiveOrderUrl(Number(id)), true)
      .then(() => {
        HandleShowToast(setToast, true, "Receive order success", 5);
        getOrderPharmacyDetail();
        setShowReceiveConfirmation(false);
      })
      .catch((error: Error) => {
        if (error.message == MsgRefreshTokenNotFound) {
          navigate("/auth/login");
        }
        setShowReceiveConfirmation(false);
        HandleShowToast(setToast, false, error.message, 5);
      });
  };

  return (
    <>
      {orderPharmacyDetail && (
        <div className="flex flex-col gap-[2rem]">
          <div className="flex flex-col gap-[1rem] p-[2rem] bg-lightGrey rounded-[20px]">
            <div className="w-full flex flex-row justify-between items-center text-[17px] font-bold text-navy">
              <div className="flex flex-row gap-[1rem]">
                <img
                  className="w-[30px] cursor-pointer"
                  alt="Chevron Left Icon"
                  src={chevronLeftIcon}
                  onClick={() => navigate(`/orders`)}
                />
                {OrderStatusMap[orderPharmacyDetail.order_status_id]}
              </div>
              {orderPharmacyDetail.order_status_id === 5 && (
                <Button
                  type="button"
                  buttonStyle="green"
                  additionalClassName="w-fit"
                  onClick={() => setShowReceiveConfirmation(true)}
                >
                  Receive order
                </Button>
              )}
            </div>
          </div>
          <div className="flex flex-row gap-[0.75rem] justify-between items-center border-[1px] p-4 w-[40%] cursor-pointer hover:translate-y-px hover:translate-x-px">
            <div className="flex flex-col gap-[0.75rem]">
              <div className="flex flex-row items-center gap-[0.5rem]">
                <img className="w-[20px]" alt="Pin Icon" src={pinIcon} />
                <p className="text-navy text-[17px] font-bold">
                  Shipping address
                </p>
              </div>
              <p>{orderPharmacyDetail.address}</p>
            </div>
          </div>
          <OrderPharmacyTable orderPharmacy={orderPharmacyDetail} />
          <table className="w-[40%] border-[1px] text-navy text-[17px] font-bold">
            <tbody>
              {orderPharmacyDetail.created_at && (
                <tr>
                  <td className="border-[1px] p-4 w-[50%] bg-lightGrey">
                    <div className="flex justify-start font-bold">
                      Order Placed
                    </div>
                  </td>
                  <td className="border-[1px] p-4 w-[50%]">
                    <div className="flex justify-start text-[#7b7c7c]">
                      {FormatDateToYMDWithDay(orderPharmacyDetail.created_at)}
                    </div>
                  </td>
                </tr>
              )}
              {orderPharmacyDetail.updated_at && (
                <tr>
                  <td className="border-[1px] p-4 w-[50%] bg-lightGrey">
                    <div className="flex justify-start font-bold">
                      Last Updated
                    </div>
                  </td>
                  <td className="border-[1px] p-4 w-[50%]">
                    <div className="flex justify-start text-[#7b7c7c]">
                      {FormatDateToYMDWithDay(orderPharmacyDetail.updated_at)}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
      )}
    </>
  );
};

export default UserOrderPharmacyDetailPage;
