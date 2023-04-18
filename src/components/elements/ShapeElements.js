import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Animated, PanResponder, TouchableOpacity } from "react-native";
import Svg, { Rect, Ellipse, Line } from "react-native-svg";
import { useDispatch, useSelector } from "react-redux";

import {
  ELLIPSE,
  ICON,
  LINE,
  RECTANGLE,
  MOVE,
  SIZE,
} from "../../constants/property";
import {
  handleSelectShape,
  updateShapePosition,
  updateShapeSize,
} from "../../features/reducers/shapeSlice";

export default function ShapeElements() {
  const dispatch = useDispatch();
  const shapeElements = useSelector((state) => state.shapeReducer.elements);
  const selectedShapeProperty = useSelector(
    (state) => state.shapeReducer.shapeProperties.selectedProperty,
  );
  const selectedShapeIndex = useSelector(
    (state) => state.shapeReducer.shapeProperties.selectedIndex,
  );

  const [moveResponder, setMoveResponder] = useState({});
  const selectedIndexRef = useRef(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const movePan = useRef(new Animated.ValueXY()).current;

  const [resizeResponder, setResizeResponder] = useState({});
  const shapeRef = useRef({});
  const scaleRef = useRef(new Animated.Value(1)).current;
  const sizePositionRef = useRef(0);

  const getDistance = (touch1, touch2) => {
    const dx = touch1.pageX - touch2.pageX;
    const dy = touch1.pageY - touch2.pageY;

    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleSelect = (index) => {
    selectedIndexRef.current = index;
    shapeRef.current = shapeElements;
    dispatch(handleSelectShape(index));
  };

  const renderShapeElements = (element, index) => {
    const isSelected = index === selectedShapeIndex;

    const positionStyle = {
      left: element[index]?.x,
      top: element[index]?.y,
    };

    let shapeElements;
    switch (element[index].type) {
      case ICON:
        shapeElements = (
          <MaterialCommunityIcons
            name={element[index].name}
            size={element[index].size}
            color={element[index].color}
          />
        );
        break;
      case RECTANGLE:
        shapeElements = (
          <Svg height={element[index].height} width={element[index].width}>
            <Rect
              width={element[index].width}
              height={element[index].height}
              stroke={element[index].stroke}
              strokeWidth={element[index].strokeWidth}
              fill={element[index].color}
            />
          </Svg>
        );
        break;
      case ELLIPSE:
        shapeElements = (
          <Svg
            height={element[index].height * 2}
            width={element[index].width * 2}
          >
            <Ellipse
              cx={element[index].width}
              cy={element[index].height}
              rx={element[index].width * 0.98}
              ry={element[index].height * 0.98}
              stroke={element[index].stroke}
              strokeWidth={element[index].strokeWidth}
              fill={element[index].color}
            />
          </Svg>
        );
        break;
      case LINE:
        shapeElements = (
          <Svg height={20} width={element[index].x2}>
            <Line
              x1={element[index].x1}
              y1={element[index].y1}
              x2={element[index].x2}
              y2={element[index].y2}
              stroke={element[index].stroke}
              strokeWidth={element[index].strokeWidth}
            />
          </Svg>
        );
        break;
      default:
        break;
    }

    if (isSelected && selectedShapeProperty === SIZE) {
      return (
        <Animated.View
          key={Date.now() + index}
          onPress={() => handleSelect(index)}
          style={[positionStyle, { transform: [{ scale: scaleRef }] }]}
          {...resizeResponder.panHandlers}
        >
          <TouchableOpacity>{shapeElements}</TouchableOpacity>
        </Animated.View>
      );
    }

    if (isSelected && selectedShapeProperty === MOVE) {
      return (
        <Animated.View
          key={Date.now() + index}
          onPress={() => handleSelect(index)}
          style={[
            positionStyle,
            {
              transform: [{ translateX: movePan.x }, { translateY: movePan.y }],
            },
          ]}
          {...moveResponder.panHandlers}
        >
          <TouchableOpacity>{shapeElements}</TouchableOpacity>
        </Animated.View>
      );
    }

    return (
      <TouchableOpacity
        key={Date.now() + index}
        onPress={() => handleSelect(index)}
        style={[{ position: "absolute" }, positionStyle]}
      >
        {shapeElements}
      </TouchableOpacity>
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
            shapeRef.current[selectedIndexRef.current]?.width * scaleRef._value;
          const newHeight =
            shapeRef.current[selectedIndexRef.current]?.height *
            scaleRef._value;

          dispatch(
            updateShapeSize({
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
            updateShapePosition({
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
      {Object.keys(shapeElements).map((element, index) =>
        renderShapeElements(shapeElements, index),
      )}
    </>
  );
}
