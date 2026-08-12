import {Easing, interpolate, useCurrentFrame} from "remotion";

type FilmCaptionProps = {
  readonly kicker: string;
  readonly title: string;
  readonly copy: string;
  readonly fadeOutFrom?: number;
  readonly style?: React.CSSProperties;
};

export const FilmCaption = ({
  kicker,
  title,
  copy,
  fadeOutFrom,
  style,
}: FilmCaptionProps) => {
  const frame = useCurrentFrame();
  const enterOpacity = interpolate(frame, [0, 28], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitOpacity =
    fadeOutFrom === undefined
      ? 1
      : interpolate(frame, [fadeOutFrom, fadeOutFrom + 38], [1, 0], {
          easing: Easing.bezier(0.4, 0, 1, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  return (
    <div
      className="scene-caption"
      style={{
        ...style,
        opacity: enterOpacity * exitOpacity,
        translate: interpolate(frame, [0, 36], ["0px 18px", "0px 0px"], {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      <div className="scene-caption-kicker">{kicker}</div>
      <h2>{title}</h2>
      <p>{copy}</p>
    </div>
  );
};
