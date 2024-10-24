import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { IAddressRequest, emptyAddressRequest } from "../interfaces/Address";
import { HandleAddRaw } from "../util/API";

type InitialState = {
  address: IAddressRequest | null;
  loading: boolean;
  error: string;
};

const initialState: InitialState = {
  address: null,
  loading: false,
  error: "",
};

export const addAddressAutofillThunk = createAsyncThunk(
  "address/add",
  async (address: IAddressRequest, { rejectWithValue }) => {
    try {
      const url = import.meta.env.VITE_HTTP_BASE_URL +  "/address/autofill";

      const bodyRaw = JSON.stringify({
        province_name: address.province,
        city_name: address.city,
        district_name: address.district,
        subdistrict_name: address.subdistrict,
        latitude: String(address.latitude),
        longitude: String(address.longitude),
        label: address.label,
        address: address.address,
        is_main: address.isMain,
      })

      return HandleAddRaw(url, bodyRaw, true);
    } catch (err) {
      return rejectWithValue({ message: err });
    }
  }
);

const addressFormSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    addAddress: (state, action: PayloadAction<IAddressRequest>) => {
      state.address = action.payload ?? emptyAddressRequest();
    },
    addAddressLabel: (state, action: PayloadAction<string>) => {
      if (action.payload !== "")
        state.address = {
          ...(state.address ?? emptyAddressRequest()),
          label: action.payload,
        };
    },
    addAddressIsMain: (state, action: PayloadAction<boolean>) => {
      state.address = {
        ...(state.address ?? emptyAddressRequest()),
        isMain: action.payload,
      };
    },
    resetState: (state) => {
      state.address = null;
      state.loading = false;
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addAddressAutofillThunk.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(addAddressAutofillThunk.fulfilled, (state) => {
      state.loading = false;
      state.address = null;
      state.error = "";
    });
    builder.addCase(addAddressAutofillThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Something went wrong";
    });
  },
});

export default addressFormSlice.reducer;
export const { addAddress, addAddressLabel, addAddressIsMain, resetState } =
  addressFormSlice.actions;
