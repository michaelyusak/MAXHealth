import React, { useCallback, useContext, useEffect, useState } from "react";

import Button from "../components/Button";
import Dialog from "../components/Dialog";

import { HandleDelete, HandleGet } from "../util/API";
import { IAddress } from "../interfaces/Address";
import { HandleShowToast } from "../util/ShowToast";
import { ToastContext } from "../contexts/ToastData";
import AddressForm from "../components/AddressForm";
import AddAddressCard from "../components/AddAddressCard";
import AddressMap from "../components/AddressMap";
import { Noop } from "../constants/Noop";
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";
import { useNavigate } from "react-router-dom";

const AddressProfilePage = (): React.ReactElement => {
  const navigate = useNavigate();

  const { setToast } = useContext(ToastContext);

  const [address, setAddress] = useState<IAddress[]>([]);
  const [showAddAddressDialog, setShowAddAddressDialog] =
    useState<boolean>(false);
  const [showMapDialog, setShowMapDialog] = useState<boolean>(false);
  const [showAddSearchedAddressDialog, setShowSearchedAddAddressDialog] =
    useState<boolean>(false);
  const [showManuallyAddAddressDialog, setShowManuallyAddAddressDialog] =
    useState<boolean>(false);
  const [showEditAddressDialog, setShowEditAddressDialog] =
    useState<boolean>(false);
  const [showDeleteConfirmationDialog, setShowDeleteConfirmationDialog] =
    useState<boolean>(false);
  const [selectedAddress, setSelectedAddress] = useState<IAddress | null>(null);

  const getAddress = useCallback(() => {
    const url = import.meta.env.VITE_HTTP_BASE_URL +  "/address";

    HandleGet<{ address: IAddress[] }>(url, true)
      .then((responseData) => {
        setAddress(responseData.address);
      })
      .catch((error: Error) => {
        if (error.message == MsgRefreshTokenNotFound) {
          navigate("/auth/login");
        }

        HandleShowToast(setToast, false, error.message, 5);
      });
  }, [setToast, navigate]);

  function handleDeleteAddress() {
    if (selectedAddress?.id)
      HandleDelete(import.meta.env.VITE_HTTP_BASE_URL +  `/address/${selectedAddress.id}`, true)
        .then(() => {
          HandleShowToast(setToast, true, "Delete address success", 5);
          setShowDeleteConfirmationDialog(false);
          setSelectedAddress(null);
          getAddress();
        })
        .catch((error: Error) => {
          if (error.message == MsgRefreshTokenNotFound) {
            navigate("/auth/login");
          }

          HandleShowToast(setToast, false, error.message, 5);
        });
  }

  useEffect(() => {
    getAddress();
  }, [getAddress]);

  return (
    <>
      <div className="w-full lg:w-[70%] flex flex-col gap-[2rem]">
        <div className="flex flex-row justify-between items-center">
          <p className="text-[18px] md:text-[20px] xl:text-[24px] font-bold">My Address</p>
          <button
            onClick={() => setShowAddAddressDialog(true)}
            className="py-[7px] xl:py-[5px] bg-green-500 text-white text-[14px] xl:text-[18px] rounded-[8px] w-[50px]"
          >
            Add
          </button>
        </div>
        {address &&
          address.length > 0 &&
          address.map((addr) => (
            <div
              key={addr.id}
              className="flex flex-col gap-[10px] justify-between p-2 md:p-[3rem] rounded-[10px] h-fit bg-white shadow-[0_5px_20px_-8px_rgba(0,0,0,0.3)]"
            >
              <div className="flex flex-col gap-[0.5rem]">
                {addr.is_main && (
                  <div className="w-fit px-[0.25rem] py-[2px] text-[#1F5FFF] text-[16px] border-[1px] border-[#1F5FFF]">
                    Main
                  </div>
                )}
                <p className="text-[20px] font-bold">{addr.label}</p>
                <p className="text-[16px]">{addr.address}</p>
                <p className="text-[16px]">
                  {addr.subdistrict?.name}, {addr.district?.name},{" "}
                  {addr.city?.name}, {addr.province?.name}
                </p>
              </div>
              <div className="flex justify-start gap-[1rem]">
                <button
                  onClick={() => {
                    setSelectedAddress(addr);
                    setShowEditAddressDialog(true);
                  }}
                  className="py-[5px] bg-blue-500 text-white text-[18px] rounded-[8px] w-[80px]"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirmationDialog(true);
                    setSelectedAddress(addr);
                  }}
                  className="py-[5px] bg-red-500 text-white text-[18px] rounded-[8px] w-[80px]"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>
      {showAddAddressDialog && (
        <Dialog
          content={
            <AddAddressCard
              onNextStep={() => {
                setShowAddAddressDialog(false);
                setShowMapDialog(true);
              }}
              onManualAdd={() => {
                setShowAddAddressDialog(false);
                setShowManuallyAddAddressDialog(true);
              }}
            />
          }
          onClose={() => {
            setShowAddAddressDialog(false);
          }}
        />
      )}
      {showMapDialog && (
        <Dialog
          content={
            <AddressMap
              onNextStep={() => {
                setShowMapDialog(false);
                setShowSearchedAddAddressDialog(true);
              }}
              onManualAdd={() => {
                setShowMapDialog(false);
                setShowManuallyAddAddressDialog(true);
              }}
            />
          }
          onClose={() => {
            setShowMapDialog(false);
          }}
        />
      )}
      {showAddSearchedAddressDialog && (
        <Dialog
          content={
            <AddressForm
              onSubmit={() => {
                setShowSearchedAddAddressDialog(false);
                getAddress();
              }}
              isFilled
              onManualAdd={() => {
                setShowSearchedAddAddressDialog(false);
                setShowManuallyAddAddressDialog(true);
              }}
            />
          }
          onClose={() => {
            setShowSearchedAddAddressDialog(false);
          }}
        />
      )}
      {showManuallyAddAddressDialog && (
        <Dialog
          content={
            <AddressForm
              onSubmit={() => {
                setShowManuallyAddAddressDialog(false);
                getAddress();
              }}
              onManualAdd={Noop}
            />
          }
          onClose={() => {
            setShowManuallyAddAddressDialog(false);
          }}
        />
      )}
      {showEditAddressDialog && selectedAddress && (
        <Dialog
          content={
            <AddressForm
              onSubmit={() => {
                setShowEditAddressDialog(false);
                getAddress();
              }}
              initialAddress={selectedAddress}
              onManualAdd={Noop}
            />
          }
          onClose={() => {
            setShowEditAddressDialog(false);
          }}
        />
      )}
      {showDeleteConfirmationDialog && (
        <Dialog
          content={
            <div className="flex flex-col justify-center items-center gap-[1rem]">
              <p>Delete address?</p>
              <div className="flex flex-row gap-[1rem]">
                <Button
                  type="button"
                  buttonStyle="blue"
                  onClick={() => {
                    setShowDeleteConfirmationDialog(false);
                    setSelectedAddress(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  buttonStyle="red"
                  onClick={() => handleDeleteAddress()}
                >
                  OK
                </Button>
              </div>
            </div>
          }
          onClose={() => {
            setShowDeleteConfirmationDialog(false);
          }}
        />
      )}
    </>
  );
};

export default AddressProfilePage;
