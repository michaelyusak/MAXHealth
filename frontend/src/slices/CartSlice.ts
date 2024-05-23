import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItemInter } from "../interfaces/CartItem";

export type InitialState = {
  pharmacyItems: {
    pharmacyId: number;
    pharmacyName: string;
    items: CartItemInter[];
  }[];
  totalQuantity: number;
  totalItems: number;
  totalAmount: number;
  changed: boolean;
  disabledCheckout: boolean;
  pageCount: number;
};

const initialState: InitialState = {
  pharmacyItems: [],
  totalQuantity: 0,
  totalItems: 0,
  totalAmount: 0,
  changed: false,
  disabledCheckout: true,
  pageCount: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    replaceCart(state, action) {
      const groupedByPharmacyId: {
        [key: number]: {
          pharmacyId: number;
          pharmacyName: string;
          items: CartItemInter[];
        };
      } = {};

      let quantity = 0;
      let counter = 0;
      for (const cartItem of action.payload.items) {
        const pharmacyId = cartItem.pharmacy_drugs.pharmacy_id;
        if (!groupedByPharmacyId[pharmacyId]) {
          groupedByPharmacyId[pharmacyId] = {
            pharmacyId: cartItem.pharmacy_drugs.pharmacy_id,
            pharmacyName: cartItem.pharmacy_drugs.pharmacy_name,
            items: [
              {
                ...cartItem,
                isSufficient: false,
              },
            ],
          };
        } else {
          groupedByPharmacyId[pharmacyId].items.push(cartItem);
        }
        quantity += cartItem.quantity;
        counter += 1;
      }
      state.pharmacyItems = Object.values(groupedByPharmacyId);
      state.totalAmount = 0;
      state.pageCount = action.payload.pageCount;
      state.totalItems = counter;
      state.totalQuantity = quantity;
    },
    replaceCartWithPagination(state, action) {
      const groupedByPharmacyId: {
        [key: number]: {
          pharmacyId: number;
          pharmacyName: string;
          items: CartItemInter[];
        };
      } = {};

      for (const cartItem of action.payload.items) {
        const pharmacyId = cartItem.pharmacy_drugs.pharmacy_id;
        if (!groupedByPharmacyId[pharmacyId]) {
          groupedByPharmacyId[pharmacyId] = {
            pharmacyId: cartItem.pharmacy_drugs.pharmacy_id,
            pharmacyName: cartItem.pharmacy_drugs.pharmacy_name,
            items: [
              {
                ...cartItem,
                isSufficient: false,
              },
            ],
          };
        } else {
          groupedByPharmacyId[pharmacyId].items.push(cartItem);
        }
      }
      state.pharmacyItems = Object.values(groupedByPharmacyId);
      state.totalAmount = 0;
      state.pageCount = action.payload.pageCount;
    },
    addItemToCart(state, action) {
      const newItem = action.payload;

      const newPharmacyItems = [...state.pharmacyItems];
      for (let i = 0; i < newPharmacyItems.length; i++) {
        const newItems = newPharmacyItems[i].items;
        for (let j = 0; j < newItems.length; j++) {
          const item = newItems[j];
          if (item.pharmacy_drugs.pharmacy_drug_id === newItem.pharmacyDrugId) {
            item.quantity = item.quantity + newItem.quantity;
            item.total_price =
              item.total_price + newItem.price * newItem.quantity;
          } else {
            newItems.push({
              cart_item_id: newItem.cartItemId,
              account_id: newItem.accountId,
              quantity: newItem.quantity,
              price: newItem.price,
              pharmacy_drugs: {
                pharmacy_drug_id: newItem.pharmacyDrugId,
                pharmacy_id: newItem.pharmacyId,
                pharmacy_name: newItem.pharmacyName,
                drug_name: newItem.drugName,
                price: newItem.price,
                image: newItem.image,
                stock: newItem.stock,
              },
              total_price: newItem.price * newItem.quantity,
              isSelected: false,
            });
          }
        }
        newPharmacyItems[i].items = newItems;
      }

      state.pharmacyItems = newPharmacyItems;
    },
    addQuantityCart(state, action) {
      const newItem = action.payload;

      let totalQuantity = 0;

      const newPharmacyItems = [...state.pharmacyItems];
      for (let i = 0; i < newPharmacyItems.length; i++) {
        const newItems = newPharmacyItems[i].items;
        for (let j = 0; j < newItems.length; j++) {
          const item = newItems[j];
          if (item.cart_item_id === newItem.cartItemId) {
            item.quantity = newItem.quantity;
            item.total_price =
              item.total_price + newItem.price * newItem.quantity;
            if (item.isSelected) {
              state.totalAmount += Number(item.pharmacy_drugs.price);
            }
          }
          totalQuantity += item.quantity;
        }
        newPharmacyItems[i].items = newItems;
      }

      state.pharmacyItems = newPharmacyItems;
      state.totalQuantity = totalQuantity;
    },
    subsQuantityCart(state, action: PayloadAction<number>) {
      state.totalQuantity--;
      state.changed = true;

      const cartItemId = action.payload;
      let index = -1;
      let disabled = true;
      let emptyItems = true;

      const newPharmacyItems = [...state.pharmacyItems];
      for (let i = 0; i < newPharmacyItems.length; i++) {
        const newItems = newPharmacyItems[i].items;
        for (let j = 0; j < newItems.length; j++) {
          const item = newItems[j];
          if (item.cart_item_id === cartItemId) {
            if (item.quantity === 1) {
              index = j;
            } else {
              item.quantity--;
              if (item.isSelected) {
                disabled = false;
              }
            }
            if (item.isSelected) {
              state.totalAmount -=
                item.quantity * Number(item.pharmacy_drugs.price);
            }
          } else {
            if (item.isSelected) {
              disabled = false;
            }
          }
        }
        if (index !== -1) {
          newItems.splice(index, 1);
          newPharmacyItems[i].items = newItems;
          index = -1;
        }
        if (newItems.length > 0) {
          emptyItems = false;
        }
      }

      state.pharmacyItems = newPharmacyItems;

      if (disabled || emptyItems) {
        state.disabledCheckout = true;
      } else {
        state.disabledCheckout = false;
      }
    },
    removeItemFromCart(state, action: PayloadAction<number>) {
      state.changed = true;

      const cartItemId = action.payload;
      let index = -1;
      let disabled = true;
      let emptyItems = true;

      const newPharmacyItems = [...state.pharmacyItems];
      for (let i = 0; i < newPharmacyItems.length; i++) {
        const newItems = newPharmacyItems[i].items;
        for (let j = 0; j < newItems.length; j++) {
          const item = newItems[j];
          if (item.cart_item_id === cartItemId) {
            index = j;
            state.totalQuantity = state.totalQuantity - item.quantity;
            if (item.isSelected) {
              state.totalAmount -=
                item.quantity * Number(item.pharmacy_drugs.price);
            }
          } else {
            if (item.isSelected) {
              disabled = false;
            }
          }
        }
        if (index !== -1) {
          newItems.splice(index, 1);
          newPharmacyItems[i].items = newItems;
          index = -1;
        }
        if (newItems.length > 0) {
          emptyItems = false;
        }
      }
      state.pharmacyItems = newPharmacyItems;

      if (disabled || emptyItems) {
        state.disabledCheckout = true;
      } else {
        state.disabledCheckout = false;
      }
    },
    subtractTotalQuantity(state, action: PayloadAction<number>) {
      state.totalQuantity -= action.payload;
    },
    setItemSelected(state, action: PayloadAction<{ cartItemId: number }>) {
      const newPharmacyItems = [...state.pharmacyItems];

      let disabled = true;
      for (let j = 0; j < newPharmacyItems.length; j++) {
        const newItems = newPharmacyItems[j].items;
        for (let j = 0; j < newItems.length; j++) {
          const item = newItems[j];
          if (item.cart_item_id === action.payload.cartItemId) {
            if (item.isSelected) {
              item.isSelected = false;
            } else {
              item.isSelected = true;
            }
            if (item.isSelected) {
              state.totalAmount +=
                item.quantity * Number(item.pharmacy_drugs.price);
              disabled = false;
            } else {
              state.totalAmount -=
                item.quantity * Number(item.pharmacy_drugs.price);
            }
          }
          if (item.isSelected) disabled = false;
        }
        newPharmacyItems[j].items = newItems;
      }

      state.pharmacyItems = newPharmacyItems;
      if (!disabled) {
        state.disabledCheckout = false;
      } else {
        state.disabledCheckout = true;
      }
    },
  },
});

export const cartActions = cartSlice.actions;
export default cartSlice;
