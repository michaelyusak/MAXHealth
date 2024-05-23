import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItemInter } from "../interfaces/CartItem";
import { ICourier, IPharmacyCourier } from "../interfaces/Order";
import { IAddress } from "../interfaces/Address";

export type InitialState = {
  pharmacyItems: {
    pharmacyId: number;
    pharmacyName: string;
    pharmacyCourier: [number, number];
    deliveryFee: number;
    items: CartItemInter[];
    courierOptions: ICourier[];
    subtotal: number;
    distance: number;
  }[];
  cartItemIds: number[];
  productsSubtotal: number;
  shippingSubtotal: number;
  total: number;
  address: IAddress;
  disabledOrder: boolean;
  loading: boolean;
  error: string;
};

const initialState: InitialState = {
  pharmacyItems: [],
  cartItemIds: [],
  productsSubtotal: 0,
  shippingSubtotal: 0,
  total: 0,
  address: {
    id: 0,
    province_name: "",
    city_name: "",
    district_name: "",
    subdistrict_name: "",
    latitude: "",
    longitude: "",
    address: "",
  },
  disabledOrder: true,
  loading: false,
  error: "",
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    proceedCheckout(
      state,
      action: PayloadAction<
        {
          pharmacyId: number;
          pharmacyName: string;
          items: CartItemInter[];
        }[]
      >
    ) {
      const cartItemIds = [];
      const pharmacyItems: {
        pharmacyId: number;
        pharmacyName: string;
        pharmacyCourier: [number, number];
        deliveryFee: number;
        items: CartItemInter[];
        courierOptions: ICourier[];
        subtotal: number;
        distance: number;
      }[] = [];
      let subtotal = 0;
      for (let i = 0; i < action.payload.length; i++) {
        const pharmacy = action.payload[i];
        const items: CartItemInter[] = [];
        let pharmacySubtotal = 0;
        for (let j = 0; j < pharmacy.items.length; j++) {
          const item = pharmacy.items[j];
          if (item.isSelected) {
            pharmacySubtotal +=
              item.quantity * Number(item.pharmacy_drugs.price);
            cartItemIds.push(item.cart_item_id);
            items.push(item);
          }
        }
        if (items.length > 0) {
          pharmacyItems.push({
            ...pharmacy,
            items: items,
            pharmacyCourier: [0, 0],
            deliveryFee: 0,
            courierOptions: [],
            subtotal: pharmacySubtotal,
            distance: 0,
          });
          subtotal += pharmacySubtotal;
        }
      }
      state.pharmacyItems = pharmacyItems;
      state.cartItemIds = cartItemIds;
      state.productsSubtotal = subtotal;
      state.total = subtotal;
    },
    updatePharmacyShipping(
      state,
      action: PayloadAction<{
        pharmacyId: number;
        pharmacyCourierId: number;
        optionIndex: number;
        deliveryFee: number;
      }>
    ) {
      let disabled = false;
      let shippingSubtotal = 0;
      for (let i = 0; i < state.pharmacyItems.length; i++) {
        if (state.pharmacyItems[i].pharmacyId === action.payload.pharmacyId) {
          state.pharmacyItems[i] = {
            ...state.pharmacyItems[i],
            pharmacyCourier: [
              action.payload.pharmacyCourierId,
              action.payload.optionIndex,
            ],
            deliveryFee: action.payload.deliveryFee,
          };
          shippingSubtotal += action.payload.deliveryFee;
        } else {
          shippingSubtotal += state.pharmacyItems[i].deliveryFee;
          if (
            state.pharmacyItems[i].deliveryFee === 0 &&
            state.pharmacyItems[i].courierOptions.length > 0
          ) {
            disabled = true;
          }
        }
      }

      if (!disabled) {
        state.disabledOrder = false;
      }

      state.shippingSubtotal = shippingSubtotal;
      state.total = state.productsSubtotal + shippingSubtotal;
    },
    updateShippingOptions(state, action: PayloadAction<IPharmacyCourier[]>) {
      const newItems = [...state.pharmacyItems];
      for (let i = 0; i < newItems.length; i++) {
        const item = newItems[i];
        for (let j = 0; j < action.payload.length; j++) {
          const pharmacyCourier = action.payload[j];
          if (pharmacyCourier.pharmacy_id === item.pharmacyId) {
            item.distance = pharmacyCourier.distance;
            const couriers = [];
            for (let k = 0; k < pharmacyCourier.couriers.length; k++) {
              const courier = pharmacyCourier.couriers[k];
              courier.options = courier.options.map((opt) => {
                return {
                  ...opt,
                  estimated_time_of_delivery: opt.estimated_time_of_delivery
                    .toLowerCase()
                    .replace("hari", "days"),
                };
              });
              couriers.push(courier);
            }
            item.courierOptions = couriers;
          }
        }
      }
      state.pharmacyItems = newItems;
    },
    updateAddress(state, action: PayloadAction<IAddress>) {
      state.address = action.payload;
    },
    setItemsInsufficient(state, action: PayloadAction<number[]>) {
      const include = (arr: number[], value: number) => {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i] === value) {
            return true;
          }
        }
        return false;
      };
      const newItems = [...state.pharmacyItems];
      for (let i = 0; i < state.pharmacyItems.length; i++) {
        const pharmacy = state.pharmacyItems[i];
        const updatedItems = [];
        for (let j = 0; j < pharmacy.items.length; j++) {
          const item = pharmacy.items[j];
          updatedItems.push({
            cart_item_id: item.cart_item_id,
            account_id: item.account_id,
            quantity: item.quantity,
            price: item.price,
            pharmacy_drugs: item.pharmacy_drugs,
            total_price: item.total_price,
            isSufficient: include(action.payload, item.cart_item_id),
            isSelected: true,
          });
          if (include(action.payload, item.cart_item_id))
            state.disabledOrder = true;
        }
        pharmacy.items = updatedItems;
      }
      state.pharmacyItems = newItems;
    },
    resetOrderState(state) {
      state.pharmacyItems = [];
      state.cartItemIds = [];
      state.productsSubtotal = 0;
      state.shippingSubtotal = 0;
      state.total = 0;
      state.address = {
        id: 0,
        province_name: "",
        city_name: "",
        district_name: "",
        subdistrict_name: "",
        latitude: "",
        longitude: "",
        address: "",
      };
      state.disabledOrder = true;
    },
  },
});

export default orderSlice.reducer;
export const {
  proceedCheckout,
  updatePharmacyShipping,
  updateShippingOptions,
  updateAddress,
  setItemsInsufficient,
  resetOrderState,
} = orderSlice.actions;
