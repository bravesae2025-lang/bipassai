import {Easing, interpolate} from "remotion";

const cinematicEase = Easing.bezier(0.4, 0, 0.2, 1);

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
