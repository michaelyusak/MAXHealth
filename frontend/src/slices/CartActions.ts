import { createAsyncThunk } from "@reduxjs/toolkit";
import { uiActions } from "./UiSlice";
import { cartActions } from "./CartSlice";
import {
  HandleAddRaw,
  HandleDelete,
  HandleGet,
  HandlePatchBodyRaw,
} from "../util/API";
import { CartItemInter } from "../interfaces/CartItem";

export const fetchCartData = createAsyncThunk(
  "cart/fetchCartData",
  async (_, { dispatch, rejectWithValue }) => {
    HandleGet<{
      carts: CartItemInter[];
      page_info: { page_count: number; item_count: number; page: number };
    }>(import.meta.env.VITE_HTTP_BASE_URL + "/cart/?limit=1000", true)
      .then((responseData) => {
        dispatch(
          cartActions.replaceCart({
            items: responseData.carts || [],
            pageCount: responseData.page_info.page_count,
          })
        );

        return responseData;
      })
      .catch((error: Error) => {
        return rejectWithValue(error.message);
      });
  }
);
interface PaginationRequest {
  limit: number;
  page: number;
}

export const fetchCartDataWithPagination = createAsyncThunk(
  "cart/fetchCartDataWithPagination",
  async (
    paginationRequest: PaginationRequest,
    { dispatch, rejectWithValue }
  ) => {
    HandleGet<{
      carts: CartItemInter[];
      page_info: { page_count: number; item_count: number; page: number };
    }>(
      `${import.meta.env.VITE_HTTP_BASE_URL}/cart/?${
        paginationRequest.page > 0 ? `page=${paginationRequest.page}` : ""
      }${
        paginationRequest.limit > 0 ? `&limit=${paginationRequest.limit}` : ""
      }`,
      true
    )
      .then((responseData) => {
        dispatch(
          cartActions.replaceCartWithPagination({
            items: responseData.carts || [],
            pageCount: responseData.page_info.page_count,
          })
        );

        return responseData;
      })
      .catch((error: Error) => {
        return rejectWithValue(error.message);
      });
  }
);

export const sendCartPostData = createAsyncThunk(
  "cart/sendCartPostData",
  async (
    cart: { pharmacyDrugId: number; quantity: number },
    { dispatch, rejectWithValue }
  ) => {
    dispatch(
      uiActions.showNotification({
        status: "Pending",
        title: "Sending..",
        message: "sending cart data!!",
      })
    );

    HandleAddRaw(
      import.meta.env.VITE_HTTP_BASE_URL + "/cart/",
      JSON.stringify({
        pharmacy_drug_id: cart.pharmacyDrugId,
        quantity: cart.quantity,
      }),
      true
    )
      .then(() => {
        dispatch(
          uiActions.showNotification({
            status: "success",
            title: "Successfully",
            message: "Sending cart data successfully",
          })
        );

        dispatch(fetchCartData());
      })
      .catch((error: Error) => {
        dispatch(
          uiActions.showNotification({
            status: "error",
            title: "Error!!!",
            message: error.message,
          })
        );

        return rejectWithValue("Sending cart data failed!");
      });
  }
);

export const sendCartUpdateData = createAsyncThunk(
  "cart/sendCartUpdateData",
  async (
    cart: { cart_item_id: number; quantity: number },
    { dispatch, rejectWithValue }
  ) => {
    dispatch(
      uiActions.showNotification({
        status: "Pending",
        title: "Sending..",
        message: "sending cart data!!",
      })
    );

    HandlePatchBodyRaw(
      JSON.stringify({ quantity: cart.quantity }),
      import.meta.env.VITE_HTTP_BASE_URL + `/cart/${cart.cart_item_id}`,
      true
    )
      .then(() => {
        dispatch(
          uiActions.showNotification({
            status: "success",
            title: "Successfully",
            message: "Sending cart data successfully",
          })
        );
      })
      .catch((error: Error) => {
        dispatch(
          uiActions.showNotification({
            status: "error",
            title: "Error!!!",
            message: error.message,
          })
        );

        return rejectWithValue("Sending cart data failed!");
      });
  }
);

export const sendCartDeleteData = createAsyncThunk(
  "cart/sendCartDeleteData",
  async (cart: { cart_item_id: number }, { dispatch, rejectWithValue }) => {
    dispatch(
      uiActions.showNotification({
        status: "Pending",
        title: "Sending..",
        message: "sending cart data!!",
      })
    );

    HandleDelete(
      import.meta.env.VITE_HTTP_BASE_URL + `/cart/${cart.cart_item_id}`,
      true
    )
      .then(() => {
        dispatch(
          uiActions.showNotification({
            status: "success",
            title: "Successfully",
            message: "Sending cart data successfully",
          })
        );
      })
      .catch((error: Error) => {
        dispatch(
          uiActions.showNotification({
            status: "error",
            title: "Error!!!",
            message: error.message,
          })
        );

        return rejectWithValue("Sending cart data failed!");
      });
  }
);
