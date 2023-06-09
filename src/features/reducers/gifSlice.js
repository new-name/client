import { createSlice } from "@reduxjs/toolkit";

import {
  MAX_GIF_SIZE,
  MIN_GIF_SIZE,
  SCROLL_HANDLE_HEIGHT,
} from "../../constants/size";

const gifProperties = {
  selectedProperty: "",
  selectedIndex: null,
};

const elements = {};

const initialState = {
  elements,
  gifProperties,
  gifModalVisible: false,
};

export const gifSlice = createSlice({
  name: "gif",
  initialState,
  reducers: {
    handleSelectGifProperty: (state, action) => {
      const { gifProperties } = state;

      gifProperties.selectedProperty = action.payload;
    },
    handleSelectGif: (state, action) => {
      const { gifProperties } = state;

      gifProperties.selectedIndex = action.payload;
    },
    handleRenderGif: (state, action) => {
      const property = action.payload;
      const nextIndex = Object.keys(state.elements).length;

      state.elements[nextIndex] = property;

      state.gifModalVisible = false;
    },
    handleResetGif: (state) => {
      const { gifProperties } = state;

      gifProperties.selectedIndex = null;
      gifProperties.selectedProperty = "";
    },
    updateGifModalState: (state, action) => {
      state.gifModalVisible = action.payload;

      state.gifProperties.selectedProperty = "";
    },
    updateGifSize: (state, action) => {
      const index = state.gifProperties.selectedIndex;
      const { handlerPositionOfY, scrollHeight } = action.payload;

      const updatedSize =
        MIN_GIF_SIZE +
        ((scrollHeight - SCROLL_HANDLE_HEIGHT - handlerPositionOfY) /
          (scrollHeight - SCROLL_HANDLE_HEIGHT)) *
          (MAX_GIF_SIZE - MIN_GIF_SIZE);

      state.elements[index].size = updatedSize;
    },
    updateGifPosition: (state, action) => {
      const { index, x, y } = action.payload;
      if (isNaN(x) || isNaN(y)) return;

      state.elements[index].x += x;
      state.elements[index].y += y;
    },
    updateAllGifs: (state, action) => {
      const updatedArray = action.payload;
      const sortedArray = updatedArray.sort((a, b) => a.zIndex - b.zIndex);
      const newElements = sortedArray.reduce((acc, element, index) => {
        acc[index] = { ...element };
        return acc;
      }, {});

      state.elements = newElements;
    },
    resetGifs: () => initialState,
  },
});

export const {
  handleSelectGifProperty,
  handleSelectGif,
  handleRenderGif,
  updateGifSize,
  updateGifPosition,
  updateGifModalState,
  handleResetGif,
  updateAllGifs,
  resetGifs,
} = gifSlice.actions;
export default gifSlice.reducer;
