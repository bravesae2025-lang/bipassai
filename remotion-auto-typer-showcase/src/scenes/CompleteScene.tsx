import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from "remotion";
import {GoogleDocs} from "../components/GoogleDocs";

const finalText = "Clear writing makes ideas easier to follow. Your judgment shapes the final draft.";

export const CompleteScene = () => {
  const frame = useCurrentFrame();
  const copyOpacity = interpolate(frame, [24, 58], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const copyX = interpolate(frame, [24, 70], [30, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const docLeft = interpolate(frame, [0, 66], [320, 90], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const docTop = interpolate(frame, [0, 66], [230, 170], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const docScale = interpolate(frame, [0, 66], [1, 0.7], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const controlOpacity = interpolate(frame, [0, 34], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="scene">
      <GoogleDocs
        floatOpacity={controlOpacity}
        floatState={frame < 35 ? "typing" : "hidden"}
        showCaret
        text={finalText}
        style={{
          left: docLeft,
          top: docTop,
          scale: docScale,
          transformOrigin: "top left",
        }}
      />
      <div className="closing-copy" style={{opacity: copyOpacity, translate: `${copyX}px 0`}}>
        <div className="closing-rule" />
        <h1>Start. Pause.<br />Continue.</h1>
        <p>Auto Typer stays in your control from the first character to the last.</p>
      </div>
      <div className="film-corner-note" style={{opacity: copyOpacity}}>Bipass AI · Auto Typer</div>
    </AbsoluteFill>
  );
};
