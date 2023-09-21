import { StyleSheet, Text, View, StatusBar, Dimensions } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface AnimatedPosition {
  x: Animated.SharedValue<number>;
  y: Animated.SharedValue<number>;
}

const useFollowAnimatedPosition = ({ x, y }: AnimatedPosition) => {
  const followX = useDerivedValue(() => {
    return withSpring(x.value);
  });
  const followY = useDerivedValue(() => {
    return withSpring(y.value);
  });

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: followX.value }, { translateY: followY.value }],
    };
  });

  return { followX, followY, rStyle };
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SIZE = 80;

export default function App() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const context = useSharedValue({ x: 0, y: 0 });

  const gesture = Gesture.Pan()
    .onStart((event) => {
      context.value = { x: translateX.value, y: translateY.value };
    })
    .onUpdate((event) => {
      translateX.value = event.translationX + context.value.x;
      translateY.value = event.translationY + context.value.y;
    })
    .onEnd((event) => {
      if (translateX.value > SCREEN_WIDTH / 2) {
        translateX.value = SCREEN_WIDTH - SIZE;
      } else {
        translateX.value = 0;
      }
    });

  const {
    rStyle: rBlueStyle,
    followX: blueFollowX,
    followY: blueFollowY,
  } = useFollowAnimatedPosition({
    x: translateX,
    y: translateY,
  });

  const {
    rStyle: rRedStyle,
    followX: redFollowX,
    followY: redFollowY,
  } = useFollowAnimatedPosition({
    x: blueFollowX,
    y: blueFollowY,
  });

  const {
    rStyle: rGreenStyle,
    followX: greenFollowX,
    followY: greenFollowY,
  } = useFollowAnimatedPosition({
    x: redFollowX,
    y: redFollowY,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar />
        <Animated.View
          style={[styles.circle, { backgroundColor: "green" }, rGreenStyle]}
        />
        <Animated.View
          style={[styles.circle, { backgroundColor: "red" }, rRedStyle]}
        />
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.circle, rBlueStyle]} />
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  circle: {
    height: SIZE,
    aspectRatio: 1,
    backgroundColor: "blue",
    borderRadius: SIZE / 2,
    opacity: 0.8,
    position: "absolute",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    // alignItems: "center",
    //justifyContent: "center",
  },
});
