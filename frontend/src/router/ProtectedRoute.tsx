import React, { useContext } from "react";
import Cookies from "js-cookie";
import { Navigate, Outlet } from "react-router-dom";
import { ToastContext } from "../contexts/ToastData";
import { HandleShowToast } from "../util/ShowToast";
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";

type protectedRouteProps = {
  acceptedRoles: string[];
  roleBasedOnFailRedirectTo?: { [role: string]: { to: string } };
  defaultOnnFailRedirectTo?: string;
};

const ProtectedRoute = ({
  acceptedRoles,
  roleBasedOnFailRedirectTo,
  defaultOnnFailRedirectTo,
}: protectedRouteProps): React.ReactElement => {
  const { setToast } = useContext(ToastContext);

  const data = Cookies.get("data");

  if (!data) {
    HandleShowToast(setToast, false, MsgRefreshTokenNotFound, 7, true);

    if (defaultOnnFailRedirectTo) {
      return <Navigate to={defaultOnnFailRedirectTo}></Navigate>;
    }

    return <Navigate to={"/"}></Navigate>;
  }

  const dataParsed = JSON.parse(data);

  const roleName = dataParsed["role"];

  if (acceptedRoles.includes(roleName)) {
    return <Outlet></Outlet>;
  }

  HandleShowToast(setToast, false, "You cannot enter this site", 7, true);

  if (roleBasedOnFailRedirectTo && roleBasedOnFailRedirectTo[roleName].to) {
    return <Navigate to={roleBasedOnFailRedirectTo[roleName].to}></Navigate>;
  }

  return <Navigate to={"/"}></Navigate>;
};

export default ProtectedRoute;
