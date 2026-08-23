import {interpolate, useCurrentFrame} from "remotion";
import {eased, linear} from "../lib/motion";

type Point = {readonly frame: number; readonly x: number; readonly y: number};

type PointerProps = {
  readonly points: readonly Point[];
  readonly clickFrames?: readonly number[];
  readonly clickColor?: string;
  readonly clickFill?: string;
  readonly clickRadius?: number;
  readonly visibleFrom?: number;
  readonly visibleUntil?: number;
};

export const Pointer = ({
  points,
  clickFrames = [],
  clickColor = "rgba(13, 13, 13, 0.5)",
  clickFill = "rgba(13, 13, 13, 0.08)",
  clickRadius = 22,
  visibleFrom = 0,
  visibleUntil = 100000,
}: PointerProps) => {
  const frame = useCurrentFrame();
  const input = points.map((point) => point.frame);
  const xOutput = points.map((point) => point.x);
  const yOutput = points.map((point) => point.y);
  const x = eased(frame, input, xOutput);
  const y = eased(frame, input, yOutput);
  const opacity = linear(
    frame,
    [visibleFrom, visibleFrom + 6, visibleUntil - 6, visibleUntil],
    [0, 1, 1, 0],
  );

  const closestClick = clickFrames.reduce<number | null>((closest, click) => {
    if (frame < click - 3 || frame > click + 10) return closest;
    if (closest === null || Math.abs(frame - click) < Math.abs(frame - closest)) return click;
    return closest;
  }, null);

  const clickProgress =
    closestClick === null
      ? 0
      : linear(frame, [closestClick, closestClick + 10], [0, 1]);
  const pointerScale =
    closestClick === null
      ? 1
      : eased(
          frame,
          [closestClick - 2, closestClick + 1, closestClick + 6],
          [1, 0.78, 1],
        );

  return (
    <>
      {closestClick === null ? null : (
        <div
          className="pointer-click"
          style={{
            left: x - clickRadius,
            top: y - clickRadius,
            width: clickRadius * 2,
            height: clickRadius * 2,
            backgroundColor: clickFill,
            borderColor: clickColor,
            opacity: interpolate(frame, [closestClick, closestClick + 2, closestClick + 10], [0, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            scale: 0.35 + clickProgress * 1.25,
          }}
        />
      )}
      <svg
        aria-hidden="true"
        className="pointer"
        viewBox="0 0 24 24"
        style={{left: x, top: y, opacity, scale: pointerScale}}
      >
        <path
          d="M4.4 2.8l14.5 8.3-6.6 1.5-2.6 6.4z"
          fill="#111111"
          stroke="#fff"
          strokeLinejoin="round"
          strokeWidth="1.6"
        />
      </svg>
    </>
  );
};
