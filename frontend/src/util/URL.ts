export const URL = {
  ManagerOrderPharmacySummaryUrl:
    import.meta.env.VITE_DEPLOYMENT_URL + "/manager/pharmacy-orders/summary",
};

export const UserPendingOrdersUrl = (page: number, limit: number): string =>
  import.meta.env.VITE_DEPLOYMENT_URL + `/orders/pending?${page > 0 ? `&page=${page}` : ""}${
    limit > 0 ? `&limit=${limit}` : ""
  }`;

export const AdminOrdersUrl = (
  orderStatusId: number,
  page: number,
  limit: number
): string =>
  import.meta.env.VITE_DEPLOYMENT_URL + `/admin/orders?status_id=${orderStatusId}${
    page > 0 ? `&page=${page}` : ""
  }${limit > 0 ? `&limit=${limit}` : ""}`;

export const UserOrderPharmaciesUrl = (
  orderStatusId: number,
  page: number,
  limit: number
): string =>
  import.meta.env.VITE_DEPLOYMENT_URL + `/pharmacy-orders?status_id=${orderStatusId}${
    page > 0 ? `&page=${page}` : ""
  }${limit > 0 ? `&limit=${limit}` : ""}`;

export const ManagerOrderPharmaciesUrl = (
  orderStatusId: number,
  pharmacyName: string,
  page: number,
  limit: number
): string =>
  import.meta.env.VITE_DEPLOYMENT_URL + `/manager/pharmacy-orders?${
    orderStatusId > 0 ? `status_id=${orderStatusId}` : ""
  }${pharmacyName !== "" ? `&pharmacy_name=${pharmacyName}` : ""}${
    page > 0 ? `&page=${page}` : ""
  }${limit > 0 ? `&limit=${limit}` : ""}`;

export const AdminOrderPharmaciesUrl = (
  orderStatusId: number,
  pharmacyName: string,
  page: number,
  limit: number
): string =>
  import.meta.env.VITE_DEPLOYMENT_URL + `/admin/pharmacy-orders?${
    orderStatusId > 0 ? `status_id=${orderStatusId}` : ""
  }${pharmacyName !== "" ? `&pharmacy_name=${pharmacyName}` : ""}${
    page > 0 ? `&page=${page}` : ""
  }${limit > 0 ? `&limit=${limit}` : ""}`;

export const OrderDetailUrl = (orderId: string): string =>
  import.meta.env.VITE_DEPLOYMENT_URL + `/orders/${orderId}`;

export const OrderPharmacyDetailUrl = (orderPharmacyId: string): string =>
  import.meta.env.VITE_DEPLOYMENT_URL + `/pharmacy-orders/${orderPharmacyId}`;

export const UserUploadOrderPaymentProofUrl = (orderId: number): string =>
  import.meta.env.VITE_DEPLOYMENT_URL + `/orders/${orderId}/payment-proof`;

export const UserCancelOrderUrl = (orderId: number): string =>
  import.meta.env.VITE_DEPLOYMENT_URL + `/orders/${orderId}/cancel-order`;

export const UserReceiveOrderUrl = (orderPharmacyId: number): string =>
  import.meta.env.VITE_DEPLOYMENT_URL + `/pharmacy-orders/${orderPharmacyId}/confirm-package`;

export const ManagerShipOrderUrl = (orderPharmacyId: number): string =>
  import.meta.env.VITE_DEPLOYMENT_URL + `/pharmacy-orders/${orderPharmacyId}/send-package`;

export const ManagerCancelOrderUrl = (orderPharmacyId: number): string =>
  import.meta.env.VITE_DEPLOYMENT_URL + `/pharmacy-orders/${orderPharmacyId}/cancel-package`;

export const AdminConfirmOrderPaymentUrl = (orderId: number): string =>
  import.meta.env.VITE_DEPLOYMENT_URL + `/orders/${orderId}/confirm-payment`;

export const ManagerPharmacyDrugCatagoryReportUrl = (
  pharmacyId: number,
  maxDate: string,
  minDate: string
): string =>
  import.meta.env.VITE_DEPLOYMENT_URL + `/manager/categories/reports?${
    pharmacyId > 0 ? `pharmacy_id=${pharmacyId}` : ""
  }${minDate !== "" ? `&min_date=${minDate}` : ""}${
    maxDate !== "" ? `&max_date=${maxDate}` : ""
  }`;

export const ManagerPharmacyDrugReportUrl = (
  pharmacyId: number,
  maxDate: string,
  minDate: string
): string =>
  import.meta.env.VITE_DEPLOYMENT_URL + `/manager/drugs/reports?${
    pharmacyId > 0 ? `pharmacy_id=${pharmacyId}` : ""
  }${minDate !== "" ? `&min_date=${minDate}` : ""}${
    maxDate !== "" ? `&max_date=${maxDate}` : ""
  }`;
