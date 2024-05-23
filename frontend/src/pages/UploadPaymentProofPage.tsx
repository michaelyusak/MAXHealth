import React, { useContext, useEffect, useState } from "react";

import checkIcon from "../assets/img/check-icon.png";
import crossIcon from "../assets/img/cross-icon.png";
import Button from "../components/Button";
import UploadPaymentProof from "../components/UploadPaymentProof";
import Dialog from "../components/Dialog";
import ConfirmationDialog from "../components/ConfirmationDialog";
import {
  HandleGet,
  HandlePatchBodyRaw,
  HandlePatchFormData,
} from "../util/API";
import { ToastContext } from "../contexts/ToastData";
import { HandleShowToast } from "../util/ShowToast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { path } from "../router/path";
import { IOrder } from "../interfaces/Order";
import {
  OrderDetailUrl,
  UserUploadOrderPaymentProofUrl,
  UserCancelOrderUrl,
} from "../util/URL";
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";
import { CurrencyFormatter } from "../util/CurrencyFormatter";

const UploadPaymentProofPage = (): React.ReactElement => {
  const navigate = useNavigate();

  const { orderId } = useParams<{ orderId: string }>();
  const { setToast } = useContext(ToastContext);
  const [order, setOrder] = useState<IOrder>();

  const [showCancelConfirmation, setShowCancelConfirmation] =
    useState<boolean>(false);

  const [status, setStatus] = useState<string>();

  const handleUploadPaymentProof = (file: File) => {
    setStatus("loading");

    const formData = new FormData();
    formData.append("file", file ?? "");

    HandlePatchFormData(
      formData,
      UserUploadOrderPaymentProofUrl(Number(orderId)),
      true
    )
      .then(() => {
        setStatus("success");
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 5);
        setStatus("");
      });
  };

  const handleCancelOrder = () => {
    HandlePatchBodyRaw("", UserCancelOrderUrl(Number(orderId)), true)
      .then(() => {
        setStatus("canceled");
        setShowCancelConfirmation(false);
      })
      .catch((error: Error) => {
        if (error.message == MsgRefreshTokenNotFound) {
          navigate("/auth/login");
        }
        HandleShowToast(setToast, false, error.message, 5);
      });
  };

  useEffect(() => {
    if (orderId)
      HandleGet<IOrder>(OrderDetailUrl(orderId), true)
        .then((responseData) => {
          setOrder(responseData);
        })
        .catch((error: Error) => {
          if (error.message == MsgRefreshTokenNotFound) {
            navigate("/auth/login");
          }
          HandleShowToast(setToast, false, error.message, 5);
        });
  }, [orderId, navigate, setToast]);

  return (
    <div className="min-h-[calc(100vh-500px)] flex flex-row items-center justify-center">
      {status === "success" ? (
        <div className="rounded-[20px] shadow-[0px_0px_15px_10px_rgba(0,0,0,0.03)] w-fit h-full flex flex-col gap-[2rem] p-[4rem] justify-center items-center">
          <img className="w-[100px]" alt="Check Icon" src={checkIcon} />
          <p className="text-navy text-[20px] font-bold">
            Payment Uploaded Succesfully
          </p>
          <Link to={path.orders}>
            <p className="text-brightBlue">See orders</p>
          </Link>
        </div>
      ) : status === "canceled" ? (
        <div className="rounded-[20px] shadow-[0px_0px_15px_10px_rgba(0,0,0,0.03)] w-fit h-full flex flex-col gap-[2rem] px-[8rem] py-[4rem] justify-center items-center">
          <img className="w-[100px]" alt="Cross Icon" src={crossIcon} />
          <p className="text-navy text-[20px] font-bold">Order Canceled</p>
          <Link to={path.orders}>
            <p className="text-brightBlue">See orders</p>
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-[1rem] p-[2rem] bg-lightGrey rounded-[20px] w-full">
            <div className="w-full flex flex-row justify-between items-center text-[17px] font-bold text-navy">
              Order ID: {orderId}
              <Button
                type="button"
                buttonStyle="red"
                additionalClassName="w-fit"
                onClick={() => setShowCancelConfirmation(true)}
              >
                Cancel order
              </Button>
            </div>
            <p>
              Total amount to pay:{" "}
              {CurrencyFormatter.format(order ? order.total_amount : 0)}
            </p>
            <UploadPaymentProof onUpload={handleUploadPaymentProof} />
          </div>
          {showCancelConfirmation && (
            <Dialog
              content={
                <ConfirmationDialog
                  text="Are you sure you want to cancel this order?"
                  rightButton={{
                    text: "Yes",
                    style: "red",
                    onClick: handleCancelOrder,
                  }}
                  leftButton={{
                    text: "No",
                    style: "blue",
                    onClick: () => setShowCancelConfirmation(false),
                  }}
                />
              }
              onClose={() => {
                setShowCancelConfirmation(false);
              }}
            />
          )}
          {status === "loading" && (
            <div className="fixed z-10 w-full h-[100vh] top-0 left-0 right-0 bottom-0 bg-[rgba(128,128,128,0.4)] rounded-[10px]" />
          )}
        </>
      )}
    </div>
  );
};

export default UploadPaymentProofPage;
