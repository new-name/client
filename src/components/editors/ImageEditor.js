import { useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { EDITOR_COLOR } from "../../constants/color";
import { imageFooter } from "../../constants/footerItems";
import { SIZE, UNSPLASH } from "../../constants/property";
import { APP_FOOTER_HEIGHT, SCREEN_WIDTH } from "../../constants/size";
import {
  handleSelectImageProperty,
  updateImageModalState,
} from "../../features/reducers/imageSlice";
import IconRenderer from "../IconRenderer";

export default function ImageEditor() {
  const dispatch = useDispatch();
  const selectedProperty = useSelector(
    (state) => state.imageReducer.imageProperties.selectedProperty,
  );
  const selectedImageIndex = useSelector(
    (state) => state.imageReducer.imageProperties.selectedIndex,
  );

  const handleSelectedProperty = (name) => {
    const newSelectedProperty = selectedProperty === name ? "" : name;
    dispatch(handleSelectImageProperty(newSelectedProperty));
  };

  useEffect(() => {
    if (selectedProperty === UNSPLASH) {
      dispatch(updateImageModalState(true));
    }
  }, [selectedProperty]);

  useEffect(() => {
    if (selectedProperty === SIZE && selectedImageIndex === null) {
      Alert.alert("이미지를 선택해 주세요.");
      dispatch(handleSelectImageProperty(""));
    }
  }, [selectedProperty]);

  return (
    <View>
      <View style={styles.controllerContainer}>
        <View style={styles.editorContainer}>
          {imageFooter.map((item) => (
            <IconRenderer
              element={item}
              selectedProperty={selectedProperty}
              handleSelectedProperty={handleSelectedProperty}
              key={item.iconName}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controllerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: SCREEN_WIDTH,
    height: APP_FOOTER_HEIGHT,
    backgroundColor: EDITOR_COLOR,
  },
  editorContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
});
