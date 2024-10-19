import React, { useCallback, useContext, useEffect, useState } from "react";

import Button from "../components/Button";
import Dialog from "../components/Dialog";
import { ToastContext } from "../contexts/ToastData";
import { HandleGet, HandlePatchBodyRaw } from "../util/API";
import { HandleShowToast } from "../util/ShowToast";
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";
import { useNavigate } from "react-router-dom";
import { IDoctorProfile } from "../interfaces/Doctor";
import { CurrencyFormatter } from "../util/CurrencyFormatter";
import EditDoctorProfileForm from "../components/EditDoctorProfileForm";

const DoctorProfilePage = (): React.ReactElement => {
  const navigate = useNavigate();
  const { setToast } = useContext(ToastContext);

  const [showEditDoctorProfileDialog, setShowEditDoctorProfileDialog] =
    useState<boolean>(false);

  const [doctorProfile, setDoctorProfile] = useState<IDoctorProfile>();

  function handleEditProfile() {
    setShowEditDoctorProfileDialog(false);

    const url = import.meta.env.VITE_HTTP_BASE_URL + "/doctors/profile";

    HandleGet<IDoctorProfile>(url, true)
      .then((responseData) => {
        setDoctorProfile(responseData);
      })
      .catch((error: Error) => {
        if (error.message == MsgRefreshTokenNotFound) {
          navigate("/auth/login");
        }

        HandleShowToast(setToast, false, error.message, 5);
      });
  }

  const getDoctorProfile = useCallback(async () => {
    const url = import.meta.env.VITE_HTTP_BASE_URL + "/doctors/profile";

    HandleGet<IDoctorProfile>(url, true)
      .then((responseData) => {
        setDoctorProfile(responseData);
      })
      .catch((error: Error) => {
        if (error.message == MsgRefreshTokenNotFound) {
          navigate("/auth/login");
        }

        HandleShowToast(setToast, false, error.message, 5);
      });
  }, [navigate, setToast]);

  const getDoctorIsOnline = useCallback(() => {
    const url = import.meta.env.VITE_HTTP_BASE_URL + "/doctors/availability";

    HandleGet<{ is_online: boolean }>(url, true).then((responseData) => {
      setIsDoctorOnline({
        value: responseData.is_online,
        initialValue: responseData.is_online,
      });
    });
  }, []);

  const updateDoctorIsOnline = useCallback(
    (isOnline: boolean) => {
      const url = import.meta.env.VITE_HTTP_BASE_URL + "/doctors/availability";

      HandlePatchBodyRaw(JSON.stringify({ is_online: isOnline }), url, true)
        .then(() => {
          getDoctorIsOnline();
        })
        .catch((error: Error) => {
          HandleShowToast(setToast, false, error.message, 5);
        });
    },
    [getDoctorIsOnline, setToast]
  );

  const [isDoctorOnline, setIsDoctorOnline] = useState<{
    value: boolean;
    initialValue: boolean;
  }>();

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDoctorOnline) {
        return;
      }

      if (isDoctorOnline.value != isDoctorOnline.initialValue) {
        updateDoctorIsOnline(isDoctorOnline.value);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isDoctorOnline, updateDoctorIsOnline]);

  useEffect(() => {
    getDoctorProfile();
    getDoctorIsOnline();
  }, [getDoctorProfile, getDoctorIsOnline]);

  return (
    <>
      <div className="w-full flex flex-col gap-[2rem] lg:w-[70%] lg:p-0">
        <div className="flex flex-row justify-between items-center">
          <p className="text-3xl font-bold">My Profile</p>
          <Button
            type="button"
            buttonStyle="blue"
            onClick={() => setShowEditDoctorProfileDialog(true)}
          >
            Edit
          </Button>
        </div>
        <div className="flex flex-col gap-[2rem] p-[3rem] rounded-[10px] h-fit bg-white shadow-[0_5px_20px_-8px_rgba(0,0,0,0.3)]">
          <div className="flex justify-center items-center h-[100px] w-[100px] rounded-full">
            <img
              alt=""
              src={doctorProfile ? doctorProfile.profile_picture : ""}
              className="h-[100px] w-[100px] object-cover rounded-full"
            ></img>
          </div>

          <div className="flex flex-col gap-[1rem]">
            <p className="text-[20px] font-[600]">
              {doctorProfile ? doctorProfile.name : ""}
            </p>
            <p className="text-[16px]">
              Email: {doctorProfile ? doctorProfile.email : ""}
            </p>
            <p className="text-[16px] capitalize">
              Years of experience:{" "}
              {doctorProfile ? doctorProfile.experience : 0}
            </p>
            <p className="text-[16px] capitalize">
              Fee per patient:{" "}
              {CurrencyFormatter.format(
                doctorProfile ? +doctorProfile.fee_per_patient : 0
              )}
            </p>
            <p className="text-[16px] capitalize">
              Specialization: {doctorProfile?.specialization_name}
            </p>
          </div>
          <div className="flex flex-col gap-[5px] w-[50%] justify-center">
            <h1 className="text-[16px] capitalize">availability</h1>
            <div className="relative flex">
              <input
                className="mr-2 mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-[#1a71ff] checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-primary checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[3px_-1px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-5 focus:after:w-5 focus:after:rounded-full focus:after:content-[''] checked:focus:border-primary checked:focus:bg-primary checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-neutral-600 dark:after:bg-neutral-400 dark:checked:bg-primary dark:checked:after:bg-primary dark:focus:before:shadow-[3px_-1px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca]"
                type="checkbox"
                role="switch"
                onChange={() =>
                  setIsDoctorOnline((prevVal) => {
                    if (!prevVal) {
                      return;
                    }
                    return {
                      ...prevVal,
                      value: !prevVal?.value,
                    };
                  })
                }
                id="isDoctorOnlineToggleSwitch"
                checked={isDoctorOnline ? isDoctorOnline.value : false}
              />

              <label
                className="inline-block pl-[0.15rem] hover:cursor-pointer"
                htmlFor="isDoctorOnlineToggleSwitch"
              ></label>
            </div>
          </div>
        </div>
      </div>
      {doctorProfile && showEditDoctorProfileDialog && (
        <Dialog
          content={
            <EditDoctorProfileForm
              profile={doctorProfile}
              onSubmit={() => handleEditProfile()}
            ></EditDoctorProfileForm>
          }
          onClose={() => setShowEditDoctorProfileDialog(false)}
        />
      )}
    </>
  );
};

export default DoctorProfilePage;
