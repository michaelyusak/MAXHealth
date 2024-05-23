import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type InitialState = {
  category: string;
}

const initialState: InitialState = {
  category: "",
};

export const initialCategory = createSlice({
  name: 'initailCategory',
  initialState,
  reducers: {
    store: (state, action: PayloadAction<string>) => {
      state.category = action.payload;
    },
  },
});

export default initialCategory.reducer;
export const {store} =initialCategory.actions;