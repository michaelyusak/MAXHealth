import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Navigate, Outlet } from "react-router-dom";
import { ToastContext } from "../contexts/ToastData";
import { HandleShowToast } from "../util/ShowToast";
import { MsgTokenExpired } from "../appconstants/appconstants";
import { VerifyToken } from "../util/API";

type protectedRouteProps = {
  acceptedRoles: string[];
  roleBasedOnFailRedirectTo?: { [role: string]: { to: string } };
};

const ProtectedRouteV2 = ({
  acceptedRoles,
  roleBasedOnFailRedirectTo,
}: protectedRouteProps): React.ReactElement => {
  const { setToast } = useContext(ToastContext);

  const [isValid, setIsValid] = useState<boolean>();
  const [role, setRole] = useState<string>();

  useEffect(() => {
    const role = sessionStorage.getItem("role");
    const accountId = sessionStorage.getItem("accountId");

    VerifyToken()
      .then((data) => {
        setRole(data.role);

        if (
          (role && role != data.role) ||
          (accountId && accountId != data.account_id.toString())
        ) {
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");

          sessionStorage.removeItem("role");
          sessionStorage.removeItem("accountId");

          setIsValid(false);
          return;
        }

        if (!role || !accountId) {
          sessionStorage.setItem("accountId", data.account_id.toString());
          sessionStorage.setItem("role", data.role);
        }

        if (acceptedRoles.includes(data.role)) {
          setIsValid(true);
          return;
        }

        setIsValid(false);
      })
      .catch((error: Error) => {
        if (error.message == MsgTokenExpired) {
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");

          sessionStorage.removeItem("role");
          sessionStorage.removeItem("accountId");

          HandleShowToast(
            setToast,
            false,
            "you are unauthorized to access this site",
            7,
            true
          );

          setIsValid(false);
          return;
        }

        HandleShowToast(setToast, false, error.message, 7, true);

        setIsValid(false);
      });
  }, [acceptedRoles, setToast]);

  return (
    <>
      {isValid != undefined && (
        <>
          {isValid ? (
            <Outlet></Outlet>
          ) : (
            <Navigate
              to={
                role && roleBasedOnFailRedirectTo
                  ? roleBasedOnFailRedirectTo[role].to
                  : "/"
              }
            ></Navigate>
          )}
        </>
      )}
    </>
  );
};

export default ProtectedRouteV2;
