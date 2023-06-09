import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  PanResponder,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { ACTIVE_COLOR } from "../../constants/color";
import { IMAGE, MOVE, SIZE } from "../../constants/property";
import {
  handleSelectImage,
  updateImagePosition,
  updateImageSize,
} from "../../features/reducers/imageSlice";

export default function ImageElements() {
  const dispatch = useDispatch();
  const activeEditor = useSelector(
    (state) => state.editorReducer.selectedProperty,
  );
  const imageElements = useSelector((state) => state.imageReducer.elements);
  const selectedImageProperty = useSelector(
    (state) => state.imageReducer.imageProperties.selectedProperty,
  );
  const selectedImageIndex = useSelector(
    (state) => state.imageReducer.imageProperties.selectedIndex,
  );

  const [moveResponder, setMoveResponder] = useState({});
  const selectedIndexRef = useRef(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const movePan = useRef(new Animated.ValueXY()).current;

  const handleSelect = (index) => {
    if (activeEditor !== IMAGE) return;

    selectedIndexRef.current = index;
    imageRef.current = imageElements;
    dispatch(handleSelectImage(index));
  };

  const [resizeResponder, setResizeResponder] = useState({});
  const imageRef = useRef({});
  const scaleRef = useRef(new Animated.Value(1)).current;
  const sizePositionRef = useRef(0);

  const getDistance = (touch1, touch2) => {
    const dx = touch1.pageX - touch2.pageX;
    const dy = touch1.pageY - touch2.pageY;

    return Math.sqrt(dx * dx + dy * dy);
  };

  const renderImageElements = (element, index) => {
    const isSelected = index === selectedImageIndex;

    const positionStyle = {
      left: element[index]?.x,
      top: element[index]?.y,
      zIndex: element[index]?.zIndex,
    };

    const selectedBorderStyle = isSelected
      ? {
          borderWidth: 2,
          borderColor: ACTIVE_COLOR,
          borderRadius: 10,
        }
      : {};

    const imageElements = (
      <Image
        style={[
          {
            width: element[index]?.width,
            height: element[index]?.height,
          },
          selectedBorderStyle,
        ]}
        source={{ uri: element[index]?.uri }}
      />
    );

    if (isSelected && selectedImageProperty === SIZE) {
      return (
        <Animated.View
          key={element[index]?.id}
          style={[positionStyle, { transform: [{ scale: scaleRef }] }]}
          {...resizeResponder.panHandlers}
        >
          <TouchableOpacity onPress={() => handleSelect(index)}>
            {imageElements}
          </TouchableOpacity>
        </Animated.View>
      );
    }

    if (isSelected && selectedImageProperty === MOVE) {
      return (
        <Animated.View
          key={element[index]?.id}
          onPress={() => handleSelect(index)}
          style={[
            positionStyle,
            {
              transform: [{ translateX: movePan.x }, { translateY: movePan.y }],
            },
          ]}
          {...moveResponder.panHandlers}
        >
          <TouchableOpacity>{imageElements}</TouchableOpacity>
        </Animated.View>
      );
    }

    return (
      <View
        key={element[index]?.id}
        style={[{ position: "absolute" }, positionStyle]}
      >
        <TouchableOpacity onPress={() => handleSelect(index)}>
          {imageElements}
        </TouchableOpacity>
      </View>
    );
  };

  useEffect(() => {
    setResizeResponder(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: ({ nativeEvent }) => {
          const { touches } = nativeEvent;
          if (selectedIndexRef.current === null || touches.length !== 2) return;

          if (touches.length === 2) {
            const [touch1, touch2] = touches;
            const distance = getDistance(touch1, touch2);

            sizePositionRef.current = distance;
            scaleRef._startingDistance = distance;
          }
        },
        onPanResponderMove: ({ nativeEvent }) => {
          const { touches } = nativeEvent;
          if (selectedIndexRef.current === null || touches.length !== 2) return;

          if (touches.length === 2) {
            const [touch1, touch2] = touches;
            const distance = getDistance(touch1, touch2);

            const scaleFactor = distance / scaleRef._startingDistance;
            scaleRef.setValue(scaleFactor);
          }
        },
        onPanResponderRelease: ({ nativeEvent }) => {
          if (selectedIndexRef.current === null) return;

          const newWidth =
            imageRef.current[selectedIndexRef.current]?.width * scaleRef._value;
          const newHeight =
            imageRef.current[selectedIndexRef.current]?.height *
            scaleRef._value;

          dispatch(
            updateImageSize({
              index: selectedIndexRef.current,
              width: newWidth,
              height: newHeight,
            }),
          );

          scaleRef.setValue(1);
        },
      }),
    );
  }, [scaleRef]);

  useEffect(() => {
    setMoveResponder(
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (_, gestureState) => {
          positionRef.current = {
            x: gestureState.dx,
            y: gestureState.dy,
          };

          movePan.setOffset(positionRef.current);
          movePan.setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: Animated.event(
          [null, { dx: movePan.x, dy: movePan.y }],
          { useNativeDriver: false },
        ),
        onPanResponderRelease: ({ nativeEvent }, gestureState) => {
          if (selectedIndexRef.current === null) return;

          positionRef.current = {
            x: positionRef.current.x + gestureState.dx,
            y: positionRef.current.y + gestureState.dy,
          };

          dispatch(
            updateImagePosition({
              index: selectedIndexRef.current,
              x: positionRef.current.x,
              y: positionRef.current.y,
            }),
          );

          movePan.setValue({ x: 0, y: 0 });
        },
      }),
    );
  }, [movePan]);

  return (
    <>
      {Object.keys(imageElements).map((element, index) =>
        renderImageElements(imageElements, index),
      )}
    </>
  );
}
