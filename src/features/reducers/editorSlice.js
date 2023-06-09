import { createSlice } from "@reduxjs/toolkit";

const allElements = {};
const layerElements = {};
const loading = [];

const initialState = {
  allElements,
  layerElements,
  selectedProperty: "",
  colorPickerVisible: false,
  layerModalVisible: false,
  shouldSaveInEditor: false,
  loading,
};

export const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    handleActiveEditor: (state, action) => {
      state.selectedProperty = action.payload;
    },
    handleColorModalVisible: (state, action) => {
      state.colorPickerVisible = action.payload;
    },
    handleLayerModalVisible: (state, action) => {
      state.layerModalVisible = action.payload;
      state.selectedProperty = "";
    },
    handleSaveInEditor: (state, action) => {
      const { saveValue } = action.payload;

      state.shouldSaveInEditor = saveValue;
    },
    handleLoadingData: (state, action) => {
      state.loading = action.payload;
    },
    updateNewElements: (state, action) => {
      const elements = action.payload;

      Object.keys(elements).forEach((key) => {
        const element = elements[key];
        state.allElements[element.zIndex] = element;
      });
    },
    updateAllElements: (state, action) => {
      const updatedArray = action.payload;
      const newElements = updatedArray.reduce((acc, element, index) => {
        acc[index] = { ...element };
        return acc;
      }, {});

      state.allElements = newElements;
    },
    updateLayer: (state, action) => {
      const updatedArray = action.payload;
      const newElements = updatedArray.reduce((acc, element, index) => {
        acc[index] = { ...element };
        return acc;
      }, {});

      state.layerElements = newElements;
      state.layerModalVisible = false;
    },
    resetAllElements: () => initialState,
  },
});

export const {
  handleActiveEditor,
  handleColorModalVisible,
  handleLayerModalVisible,
  handleSaveInEditor,
  handleLoadingData,
  updateNewElements,
  updateAllElements,
  updateLayer,
  resetAllElements,
} = editorSlice.actions;
export default editorSlice.reducer;
