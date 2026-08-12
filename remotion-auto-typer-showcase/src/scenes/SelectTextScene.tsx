import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from "remotion";
import {AutoTyperPopup} from "../components/AutoTyperPopup";
import {FilmCaption} from "../components/FilmCaption";
import {GoogleDocs} from "../components/GoogleDocs";
import {Pointer} from "../components/Pointer";

export const SelectTextScene = () => {
  const frame = useCurrentFrame();
  const popupX = interpolate(frame, [0, 329], [38, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const documentX = interpolate(frame, [0, 329], [-18, 4], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const selected = frame >= 210;

  return (
    <AbsoluteFill className="scene">
      <FilmCaption
        kicker="01 · Choose the text"
        title="Start with a reviewed draft."
        copy="Open Auto Typer and choose the result you want to move into your document."
      />
      <GoogleDocs
        style={{
          left: 70,
          top: 422,
          opacity: 0.38,
          scale: 0.68,
          translate: `${documentX}px 0`,
          transformOrigin: "top left",
        }}
      />
      <AutoTyperPopup
        selected={selected}
        state="list"
        style={{
          left: 1260,
          top: 100,
          scale: 1.08,
          translate: `${popupX}px 0`,
          transformOrigin: "top left",
        }}
      />
      <Pointer
        clickFrames={[210]}
        points={[
          {frame: 78, x: 1770, y: 250},
          {frame: 176, x: 1541, y: 360},
          {frame: 210, x: 1541, y: 360},
          {frame: 272, x: 1541, y: 360},
        ]}
        visibleFrom={68}
        visibleUntil={286}
      />
    </AbsoluteFill>
  );
};
