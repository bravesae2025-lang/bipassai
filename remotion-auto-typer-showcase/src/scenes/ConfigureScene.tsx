import {AbsoluteFill, useCurrentFrame} from "remotion";
import {AutoTyperPopup} from "../components/AutoTyperPopup";
import {DemoPill, FilmCaption} from "../components/FilmCaption";
import {GoogleDocs} from "../components/GoogleDocs";
import {Pointer} from "../components/Pointer";
import {eased} from "../lib/motion";

export const ConfigureScene = () => {
  const frame = useCurrentFrame();
  const popupScale = eased(frame, [0, 110], [0.985, 1.02]);
  const popupX = eased(frame, [0, 110], [18, -12]);
  const mistype = frame >= 56 ? 2 : 0;
  const speed = frame >= 27 ? "fast" : "normal";
  const target = frame >= 79 ? "5m" : "Off";

  return (
    <AbsoluteFill className="film">
      <FilmCaption
        kicker="Your pace"
        title="Set it once. Stay in control."
        copy="Pick a speed, optional typo corrections, and a target time before anything starts."
      />
      <GoogleDocs
        style={{
          left: 38,
          top: 332,
          opacity: 0.58,
          rotate: "-2.2deg",
          scale: 0.7,
          transformOrigin: "top left",
        }}
      />
      <AutoTyperPopup
        mistype={mistype}
        speed={speed}
        state="ready"
        target={target}
        style={{
          left: 1052,
          top: 96,
          scale: popupScale,
          translate: `${popupX}px 0`,
        }}
      />
      <Pointer
        clickFrames={[27, 56, 79, 108]}
        points={[
          {frame: 4, x: 1500, y: 310},
          {frame: 22, x: 1363, y: 361},
          {frame: 27, x: 1363, y: 361},
          {frame: 46, x: 1128, y: 444},
          {frame: 56, x: 1246, y: 444},
          {frame: 72, x: 1194, y: 547},
          {frame: 79, x: 1194, y: 547},
          {frame: 99, x: 1260, y: 627},
          {frame: 108, x: 1260, y: 627},
          {frame: 118, x: 1260, y: 627},
        ]}
        visibleFrom={2}
        visibleUntil={119}
      />
      <DemoPill />
    </AbsoluteFill>
  );
};
