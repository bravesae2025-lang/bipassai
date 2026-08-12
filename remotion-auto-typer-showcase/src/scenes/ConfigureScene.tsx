import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from "remotion";
import {AutoTyperPopup} from "../components/AutoTyperPopup";
import {FilmCaption} from "../components/FilmCaption";
import {GoogleDocs} from "../components/GoogleDocs";
import {Pointer} from "../components/Pointer";

export const ConfigureScene = () => {
  const frame = useCurrentFrame();
  const popupY = interpolate(frame, [0, 289], [18, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="scene">
      <FilmCaption
        kicker="02 · Set the pace"
        title="You control the rhythm."
        copy="Choose a natural speed and keep optional corrections as light as you want."
        style={{top: 118}}
      />
      <GoogleDocs
        style={{
          left: 70,
          top: 422,
          opacity: 0.38,
          scale: 0.68,
          transformOrigin: "top left",
        }}
      />
      <AutoTyperPopup
        speed={frame >= 100 ? "normal" : "slow"}
        state="ready"
        style={{
          left: 1260,
          top: 100,
          scale: 1.08,
          translate: `0 ${popupY}px`,
          transformOrigin: "top left",
        }}
      />
      <Pointer
        clickFrames={[100, 220]}
        points={[
          {frame: 34, x: 1740, y: 390},
          {frame: 76, x: 1541, y: 509},
          {frame: 100, x: 1541, y: 509},
          {frame: 154, x: 1541, y: 509},
          {frame: 204, x: 1541, y: 812},
          {frame: 220, x: 1541, y: 812},
          {frame: 258, x: 1541, y: 812},
        ]}
        visibleFrom={28}
        visibleUntil={268}
      />
    </AbsoluteFill>
  );
};
