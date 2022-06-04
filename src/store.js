import { configureStore } from '@reduxjs/toolkit'
import categoriesReducer from './categoriesSlice'

export default configureStore({
  reducer: {
    categories: categoriesReducer,
  },
})
