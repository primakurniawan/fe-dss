import { createSlice } from '@reduxjs/toolkit'

export const categoriesSlice = createSlice({
  name: 'categories',
  initialState: {
    items: [],
    selected: 0,
  },
  reducers: {
    change: (state, action) => {
      state.selected = action.payload
    },
    get: (state, action) => {
      state.items = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { change, get } = categoriesSlice.actions

export default categoriesSlice.reducer
