import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const itemSlice = createSlice({  
  name: 'item',
  initialState,
  reducers: {
    setItems (state, action) {
      state.items = action.payload;
    }
  },
})

export default itemSlice;

export const { setItems } = itemSlice.actions;
