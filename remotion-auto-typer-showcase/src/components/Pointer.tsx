import {useCurrentFrame} from "remotion";
import {eased, linear} from "../lib/motion";

type Point = {readonly frame: number; readonly x: number; readonly y: number};

type PointerProps = {
  readonly points: readonly Point[];
  readonly clickFrames?: readonly number[];
  readonly visibleFrom?: number;
  readonly visibleUntil?: number;
};

export const Pointer = ({
  points,
  clickFrames = [],
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
    if (Math.abs(frame - click) > 9) return closest;
    if (closest === null || Math.abs(frame - click) < Math.abs(frame - closest)) return click;
    return closest;
  }, null);

  const clickProgress =
    closestClick === null
      ? 0
      : linear(frame, [closestClick - 2, closestClick + 9], [0, 1]);
  const pointerScale =
    closestClick === null
      ? 1
      : eased(
          frame,
          [closestClick - 3, closestClick, closestClick + 5],
          [1, 0.86, 1],
        );

  return (
    <>
      {closestClick === null ? null : (
        <div
          className="pointer-click"
          style={{
            left: x - 22,
            top: y - 22,
            opacity: 1 - clickProgress,
            scale: 0.45 + clickProgress * 1.25,
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
          d="M5.5 3.2l13.2 7.6-6.2 1.5-2.4 5.9z"
          fill="#0d0d0d"
          stroke="#fff"
          strokeLinejoin="round"
          strokeWidth="1.6"
        />
      </svg>
    </>
  );
};
