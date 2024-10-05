import Cookies from "js-cookie";
import { IToken } from "../interfaces/Token";
import { jwtDecode } from "jwt-decode";
import {
  MsgRefreshTokenNotFound,
  MsgTokenExpired,
} from "../appconstants/appconstants";

export async function HandleSendVerificationEmail(email: string) {
  const url = import.meta.env.VITE_DEPLOYMENT_URL +  "/verification";
  const options: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email,
    }),
  };

  const response = await fetch(url, options);
  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to send email: ${responseData.message}`);
  }
}

export async function HandleRegister(inputValues: {
  [key: string]: { value: string; error: string; file?: File };
}) {
  const name = inputValues["name"]?.value;
  const email = inputValues["email"]?.value;

  const url = import.meta.env.VITE_DEPLOYMENT_URL +  "/users/register";
  const options: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email,
      name: name,
    }),
  };

  const response = await fetch(url, options);
  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to register, ${responseData.message}`);
  }

  HandleSendVerificationEmail(email);
}

export async function HandleRegisterDoctor(
  inputValues: {
    [key: string]: { value: string; error: string; file?: File };
  },
  specializationId: number
) {
  const name = inputValues["name"].value;
  const email = inputValues["email"].value;
  const certificate = inputValues["certificate"].file;

  const formData = new FormData();

  const data = {
    name: name,
    email: email,
    specialization_id: specializationId,
  };

  formData.append("data", JSON.stringify(data));
  formData.append("file", certificate ?? "");

  const url = import.meta.env.VITE_DEPLOYMENT_URL +  "/doctors/register";
  const options: RequestInit = {
    method: "POST",
    body: formData,
  };

  const response = await fetch(url, options);
  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to register, ${responseData.message}`);
  }

  HandleSendVerificationEmail(email);
}

export async function HandleVerifyPassword(
  inputValues: {
    [key: string]: { value: string; error: string };
  },
  accountId: number
) {
  const code = inputValues["code"].value;
  const password = inputValues["password"].value;

  const url = import.meta.env.VITE_DEPLOYMENT_URL +  "/verification/password";
  const options: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      account_id: accountId,
      password: password,
      verification_code: code,
    }),
  };

  const response = await fetch(url, options);
  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to verify, ${responseData.message}`);
  }
}

export async function HandleLogin(inputValues: {
  [key: string]: { value: string; error: string };
}) {
  const email = inputValues["email"].value;
  const password = inputValues["password"].value;

  const url = import.meta.env.VITE_DEPLOYMENT_URL +  "/login";
  const options: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  };

  const response = await fetch(url, options);
  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to login, ${responseData.message}`);
  }

  return responseData.data;
}

export async function HandleResetPasswordRequest(email: string) {
  const url = import.meta.env.VITE_DEPLOYMENT_URL +  "/reset-password";
  const options: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email,
    }),
  };

  const response = await fetch(url, options);
  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to send email, ${responseData.message}`);
  }
}

export async function HandleResetPassword(
  inputValues: {
    [key: string]: { value: string; error: string };
  },
  accountId: number
) {
  const code = inputValues["code"].value;
  const password = inputValues["password"].value;

  const url = import.meta.env.VITE_DEPLOYMENT_URL +  "/reset-password/verification";
  const options: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      account_id: accountId,
      password: password,
      code: code,
    }),
  };

  const response = await fetch(url, options);
  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to reset password, ${responseData.message}`);
  }
}

export async function HandleRefreshToken() {
  const url = import.meta.env.VITE_DEPLOYMENT_URL +  "/refresh-token";

  const refreshToken = Cookies.get("refreshToken");

  if (!refreshToken) {
    throw new Error(MsgRefreshTokenNotFound);
  }

  const options: RequestInit = {
    method: "POST",
    body: JSON.stringify({
      refresh_token: refreshToken,
    }),
  };

  const response = await fetch(url, options);
  const responseData = await response.json();

  if (!response.ok) {
    if (responseData.message == MsgTokenExpired) {
      throw new Error(MsgRefreshTokenNotFound);
    }

    alert(response.status);

    throw new Error(`failed to refresh token, ${responseData.message}`);
  }

  const accessTokenClaims = jwtDecode<IToken>(responseData.data.access_token);

  Cookies.set("accessToken", responseData.data.access_token, {
    expires: new Date(accessTokenClaims.exp * 1000),
  });
}

export async function HandlePatchBodyRaw(
  bodyRaw: string,
  url: string,
  withAccessToken?: boolean
) {
  let bearerToken = "";
  let accessToken = Cookies.get("accessToken");

  if (withAccessToken) {
    if (!accessToken) {
      await HandleRefreshToken();
      accessToken = Cookies.get("accessToken");
    }

    bearerToken = `Bearer ${accessToken}`;
  }

  if (withAccessToken && !accessToken) {
    return;
  }

  const options: RequestInit = {
    method: "PATCH",
    headers: { Authorization: bearerToken },
    body: bodyRaw,
  };

  const response = await fetch(url, options);
  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(`failed to update, ${responseData.message}`);
  }

  return responseData;
}

export async function HandlePatchFormData(
  formData: FormData,
  url: string,
  withAccessToken?: boolean
) {
  let bearerToken = "";
  let accessToken = Cookies.get("accessToken");

  if (withAccessToken) {
    if (!accessToken) {
      await HandleRefreshToken();
      accessToken = Cookies.get("accessToken");
    }

    bearerToken = `Bearer ${accessToken}`;
  }

  if (withAccessToken && !accessToken) {
    return;
  }

  const options: RequestInit = {
    method: "PATCH",
    headers: { Authorization: bearerToken },
    body: formData,
  };

  const response = await fetch(url, options);
  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(`failed to update, ${responseData.message}`);
  }

  return responseData;
}

export async function HandleGet<T>(
  url: string,
  withAccessToken?: boolean
): Promise<T> {
  let bearerToken = "";
  let accessToken = Cookies.get("accessToken");

  if (withAccessToken) {
    if (!accessToken) {
      await HandleRefreshToken();
      accessToken = Cookies.get("accessToken");
    }

    bearerToken = `Bearer ${accessToken}`;
  }

  const options: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: bearerToken,
    },
  };

  const response = await fetch(url, options);
  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(`failed to fetch, ${responseData.message}`);
  }

  return responseData.data;
}

export async function HandlePutRaw(
  bodyRaw: string,
  url: string,
  withAccessToken?: boolean
) {
  let bearerToken = "";
  let accessToken = Cookies.get("accessToken");

  if (withAccessToken) {
    if (!accessToken) {
      await HandleRefreshToken();
      accessToken = Cookies.get("accessToken");
    }

    bearerToken = `Bearer ${accessToken}`;
  }

  const options: RequestInit = {
    method: "PUT",
    headers: { Authorization: bearerToken },
    body: bodyRaw,
  };

  const response = await fetch(url, options);
  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to update, ${responseData.message}`);
  }

  return responseData.data;
}

export async function HandlePutFormData(
  formData: FormData,
  url: string,
  withAccessToken?: boolean
) {
  let bearerToken = "";
  let accessToken = Cookies.get("accessToken");

  if (withAccessToken) {
    if (!accessToken) {
      await HandleRefreshToken();
      accessToken = Cookies.get("accessToken");
    }

    bearerToken = `Bearer ${accessToken}`;
  }

  const options: RequestInit = {
    method: "PUT",
    headers: { Authorization: bearerToken },
    body: formData,
  };

  const response = await fetch(url, options);
  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to update, ${responseData.message}`);
  }

  return responseData.data;
}

export async function HandleDelete<T>(
  url: string,
  withAccessToken?: boolean
): Promise<T> {
  let bearerToken = "";
  let accessToken = Cookies.get("accessToken");

  if (withAccessToken) {
    if (!accessToken) {
      await HandleRefreshToken();
      accessToken = Cookies.get("accessToken");
    }

    bearerToken = `Bearer ${accessToken}`;
  }

  const options: RequestInit = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: bearerToken,
    },
  };

  const response = await fetch(url, options);
  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(`failed to delete, ${responseData.message}`);
  }

  return responseData.data;
}

export async function HandleAddFormData<T>(
  formData: FormData,
  url: string,
  withAccessToken?: boolean
): Promise<T> {
  let bearerToken = "";
  let accessToken = Cookies.get("accessToken");

  if (withAccessToken) {
    if (!accessToken) {
      await HandleRefreshToken();
      accessToken = Cookies.get("accessToken");
    }

    bearerToken = `Bearer ${accessToken}`;
  }

  const options: RequestInit = {
    method: "POST",
    headers: { Authorization: bearerToken },
    body: formData,
  };

  const response = await fetch(url, options);
  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to create data, ${responseData.message}`);
  }

  return responseData.data;
}

export async function HandleAddRaw<T>(
  url: string,
  bodyRaw: string,
  withAccessToken?: boolean
): Promise<T> {
  let bearerToken = "";
  let accessToken = Cookies.get("accessToken");

  if (withAccessToken) {
    if (!accessToken) {
      await HandleRefreshToken();
      accessToken = Cookies.get("accessToken");
    }

    bearerToken = `Bearer ${accessToken}`;
  }

  const options: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: bearerToken,
    },
    body: bodyRaw,
  };

  const response = await fetch(url, options);
  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to create data, ${responseData.message}`);
  }

  return responseData.data;
}

export async function HandleGeocodeSearch(query: string) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?${query}&key=`;
  const options: RequestInit = {
    method: "GET",
  };

  const response = await fetch(url, options);
  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to get location: ${responseData.message}`);
  }

  return responseData;
}

export async function HandleGeocodeReverse(lat: number, long: number) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&location_type=ROOFTOP&language=id&key=`;
  const options: RequestInit = {
    method: "GET",
  };

  const response = await fetch(url, options);
  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to get location: ${responseData.message}`);
  }

  return responseData;
}

export async function HandleGetPendingOrders() {
  const url = import.meta.env.VITE_DEPLOYMENT_URL +  `/orders/pending`;
  const options: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + Cookies.get("accessToken"),
    },
  };

  const response = await fetch(url, options);
  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to get orders, ${responseData.message}`);
  }

  return responseData.data;
}

export async function HandleGetAllOrderPharmacies(
  orderStatusId: number,
  page: number
) {
  const url = import.meta.env.VITE_DEPLOYMENT_URL +  `/orders?status_id=${orderStatusId}&page=${page}&limit=10`;
  const options: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + Cookies.get("accessToken"),
    },
  };

  const response = await fetch(url, options);
  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to get orders, ${responseData.message}`);
  }

  return responseData.data;
}

export async function HandleGetOrderDetail(id: string) {
  const url = import.meta.env.VITE_DEPLOYMENT_URL +  `/orders/${id}`;
  const options: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + Cookies.get("accessToken"),
    },
  };

  const response = await fetch(url, options);
  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to get order detail, ${responseData.message}`);
  }

  return responseData.data;
}

export async function HandleGetOrderPharmacyDetail(id: string) {
  const url = import.meta.env.VITE_DEPLOYMENT_URL +  `/orders/pharmacy/${id}`;
  const options: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + Cookies.get("accessToken"),
    },
  };

  const response = await fetch(url, options);
  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to get order detail, ${responseData.message}`);
  }

  return responseData.data;
}

export async function HandleUploadOrderPaymentProof(
  orderId: number,
  file: File
) {
  const formData = new FormData();

  formData.append("file", file ?? "");

  const url = import.meta.env.VITE_DEPLOYMENT_URL +  `/orders/${orderId}/payment-proof`;
  const options: RequestInit = {
    method: "PATCH",
    headers: {
      Authorization: "Bearer " + Cookies.get("accessToken"),
    },
    body: formData,
  };

  const response = await fetch(url, options);
  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to upload payment proof, ${responseData.message}`);
  }

  return responseData.data;
}

export async function HandleUserCancelOrder(orderId: number) {
  const url = import.meta.env.VITE_DEPLOYMENT_URL +  `/orders/${orderId}/cancel-order`;
  const options: RequestInit = {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + Cookies.get("accessToken"),
    },
  };

  const response = await fetch(url, options);
  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to get order detail, ${responseData.message}`);
  }

  return responseData.data;
}

export async function HandleUserReceiveOrder(orderPharmacyId: number) {
  const url = import.meta.env.VITE_DEPLOYMENT_URL +  `/pharmacy-orders/${orderPharmacyId}/confirm-package`;
  const options: RequestInit = {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + Cookies.get("accessToken"),
    },
  };

  const response = await fetch(url, options);
  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to get order detail, ${responseData.message}`);
  }

  return responseData.data;
}
