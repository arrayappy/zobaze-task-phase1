import { configureStore } from '@reduxjs/toolkit'
import itemSlice from './slices/itemSlice';

const store = configureStore({
  reducer: {
    item: itemSlice.reducer,
  }
})

export default store;