import { configureStore } from "@reduxjs/toolkit";
import AddressFormSlice from "../slices/AddressFormSlice";
import OrderSlice from "../slices/OrderSlice";
import cartReducer from "../slices/CartSlice";
import uiReducer from "../slices/UiSlice";
import { initialCategory } from "../slices/InitailCategoryFilter";

const store = configureStore({
  reducer: {
    addressForm: AddressFormSlice,
    cart: cartReducer.reducer,
    ui: uiReducer.reducer,
    initialCategory: initialCategory.reducer,
    order: OrderSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
