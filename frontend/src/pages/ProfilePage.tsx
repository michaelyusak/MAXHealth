import React, { useContext, useEffect, useState } from "react";
import Dialog from "../components/Dialog";
import EditProfileForm from "../components/EditProfileForm";
import { ToastContext } from "../contexts/ToastData";
import { IProfile } from "../interfaces/Profile";
import { HandleGet } from "../util/API";
import { HandleShowToast } from "../util/ShowToast";
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";
import { useNavigate } from "react-router-dom";
import { FormatDateToYMD } from "../util/DateFormatter";

const ProfilePage = (): React.ReactElement => {
  const navigate = useNavigate();

  const { setToast } = useContext(ToastContext);

  const [profile, setProfile] = useState<IProfile>();
  const [showEditProfileDialog, setShowEditProfileDialog] =
    useState<boolean>(false);

  function handleEditProfile() {
    setShowEditProfileDialog(false);

    const url = import.meta.env.VITE_HTTP_BASE_URL + "/users/profile";

    HandleGet<IProfile>(url, true)
      .then((responseData) => {
        setProfile(responseData);
      })
      .catch((error: Error) => {
        if (error.message == MsgRefreshTokenNotFound) {
          navigate("/auth/login");
        }

        HandleShowToast(setToast, false, error.message, 5);
      });
  }

  useEffect(() => {
    const url = import.meta.env.VITE_HTTP_BASE_URL + "/users/profile";

    HandleGet<IProfile>(url, true)
      .then((responseData) => {
        setProfile(responseData as IProfile);
      })
      .catch((error: Error) => {
        if (error.message == MsgRefreshTokenNotFound) {
          navigate("/auth/login");
        }

        HandleShowToast(setToast, false, error.message, 5);
      });
  }, [setToast, navigate]);

  return (
    <>
      <div className="w-full flex flex-col gap-[2rem] lg:w-[70%] lg:p-0">
        <div className="flex flex-row justify-between items-center">
          <p className="text-[18px] md:text-[20px] xl:text-[24px] font-bold">My Profile</p>
          <button
            onClick={() => setShowEditProfileDialog(true)}
            className="py-[7px] xl:py-[5px] bg-blue-500 text-white text-[14px] xl:text-[18px] rounded-[8px] w-[50px]"
          >
            Edit
          </button>
        </div>
        <div className="flex flex-col gap-[2rem] md:p-[3rem] p-1 rounded-[10px] h-fit md:bg-white md:shadow-[0_5px_20px_-8px_rgba(0,0,0,0.3)]">
          <div className="flex justify-center items-center h-[100px] w-[100px] rounded-full">
            <img
              alt=""
              src={profile?.profile_picture}
              className="h-[100px] w-[100px] object-cover rounded-full"
            ></img>
          </div>

          <div className="flex flex-col gap-[1rem]">
            <p className="text-[20px] font-[600]">{profile?.name}</p>
            <p className="text-[16px]">Email: {profile?.email}</p>
            <p className="text-[16px]">
              Gender:{" "}
              <span className="capitalize">
                {profile?.gender !== "" ? profile?.gender : "Not Set"}
              </span>
            </p>
            <p className="text-[16px]">
              Date of Birth:{" "}
              {profile?.date_of_birth && profile?.date_of_birth !== ""
                ? FormatDateToYMD(profile?.date_of_birth)
                : "Not Set"}
            </p>
          </div>
        </div>
      </div>
      {showEditProfileDialog && (
        <Dialog
          cardWidth="xl:w-[500px] w-[300px]"
          content={
            <EditProfileForm profile={profile} onSubmit={handleEditProfile} />
          }
          onClose={() => {
            setShowEditProfileDialog(false);
          }}
        />
      )}
    </>
  );
};

export default ProfilePage;
