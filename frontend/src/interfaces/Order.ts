export interface IOrderItem {
  id: number;
  drug_name: string;
  drug_price: number;
  drug_unit: string;
  quantity: number;
  drug_image: string;
}

export interface IOrderPayment {
  orderId: number;
  address: string;
  paymentPictureUrl: string;
  totalAmount: number;
  orderPharmacies: IOrderPharmacies[];
  createdAt: string;
}

export interface IOrderPharmacies {
  orderPharmaciesId: number;
  orderStatusId: number;
  subtotalAmount: number;
  deliveryFee: number;
  pharmacyCourier: PharmacyCouriers;
}

export interface PharmacyCouriers {
  pharmacyCourierId: number;
  pharmacyId: number;
  pharmacyName: string;
  courier: string;
}

export interface IOrderPharmacy {
  order_pharmacy_id: number;
  order_status_id: number;
  pharmacyId?: number;
  profile_picture?: string;
  pharmacy_name?: string;
  pharmacist_phone_number?: string;
  pharmacy_manager_email?: string;
  courier_name: string;
  delivery_fee?: number;
  subtotal_amount: number;
  address?: string;
  updated_at?: string;
  created_at?: string;
  order_items: IOrderItem[];
  order_items_count?: number;
  first_order_item?: IOrderItem;
}

export interface IOrder {
  id: number;
  address: string;
  payment_proof: string;
  total_amount: number;
  pharmacies: IOrderPharmacy[];
  created_at: string;
  updated_at: string;
}

export interface IOrderRequest {
  address: string;
  pharmacies: IOrderPharmacyRequest[];
  totalAmount: number;
}

export interface IOrderPharmacyRequest {
  pharmacy_id: number;
  pharmacy_courier_id: number;
  subtotal_amount: number;
  delivery_fee: number;
  cart_items: number[];
}

export interface IOrderFromPrescriptionRequest {
  address: string;
  pharmacies: IOrderPharmacyFromPrescriptionRequest[];
  prescription_id: number;
  total_amount: number;
}

export interface IOrderPharmacyFromPrescriptionRequest {
  pharmacy_id: number;
  pharmacy_courier_id: number;
  subtotal_amount: number;
  delivery_fee: number;
  pharmacy_drugs: {
    pharmacy_drug_id: number;
    quantity: number;
  }[];
}

export interface IPharmacyCourier {
  pharmacy_id: number;
  couriers: ICourier[];
  distance: number;
}

export interface ICourier {
  pharmacy_courier_id: number;
  courier_name: string;
  options: {
    price: number;
    estimated_time_of_delivery: string;
  }[];
}

export interface IOrderListResponse {
  orders: IOrder[];
  page_info: {
    page_count: number;
    item_count: number;
    page: number;
  };
}

export interface IOrderPharmacyListResponse {
  order_pharmacies: IOrderPharmacy[];
  page_info: {
    page_count: number;
    item_count: number;
    page: number;
  };
}

export const OrderStatusMap: {
  [key: number]: string;
} = {
  1: "Awaiting Payment",
  2: "Awaiting Approval",
  3: "Order Processed",
  4: "Order Sent",
  5: "Order Confirmed",
  6: "Order Canceled",
};

export const OrderStatusQueryMap: {
  [key: number]: string;
} = {
  1: "unpaid",
  2: "approval",
  3: "pending",
  4: "sent",
  5: "confirmed",
  6: "canceled",
};

export const OrderStatusQueryReverseMap: {
  [key: string]: number;
} = {
  unpaid: 1,
  approval: 2,
  pending: 3,
  sent: 4,
  confirmed: 5,
  canceled: 6,
};
