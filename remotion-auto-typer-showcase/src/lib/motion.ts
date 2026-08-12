import {Easing, interpolate} from "remotion";

const cinematicEase = Easing.bezier(0.16, 1, 0.3, 1);

export const eased = (
  frame: number,
  inputRange: readonly number[],
  outputRange: readonly number[],
) =>
  interpolate(frame, inputRange, outputRange, {
    easing: cinematicEase,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const linear = (
  frame: number,
  inputRange: readonly number[],
  outputRange: readonly number[],
) =>
  interpolate(frame, inputRange, outputRange, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
