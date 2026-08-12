import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from "remotion";
import {AutoTyperPopup} from "../components/AutoTyperPopup";
import {GoogleDocs} from "../components/GoogleDocs";

export const OpeningScene = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 24], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const copyY = interpolate(frame, [0, 52], [24, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const planeX = interpolate(frame, [0, 179], [42, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="scene" style={{opacity}}>
      <div className="film-wordmark"><i /> Bipass AI · Auto Typer</div>
      <div className="opening-copy" style={{translate: `0 ${copyY}px`}}>
        <h1>Your draft.<br />Typed at your pace.</h1>
        <p>Choose reviewed text, set the rhythm, then keep working in the document you already use.</p>
      </div>
      <div className="opening-plane" style={{translate: `${planeX}px 0`}}>
        <GoogleDocs
          style={{
            left: 0,
            top: 154,
            opacity: 0.66,
            scale: 0.62,
            transformOrigin: "top left",
          }}
        />
        <AutoTyperPopup
          state="list"
          style={{
            left: 690,
            top: 18,
            scale: 0.72,
            transformOrigin: "top left",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
