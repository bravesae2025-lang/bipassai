import {AbsoluteFill, useCurrentFrame} from "remotion";
import {AutoTyperPopup} from "../components/AutoTyperPopup";
import {DemoPill, FilmCaption} from "../components/FilmCaption";
import {GoogleDocs} from "../components/GoogleDocs";
import {Pointer} from "../components/Pointer";
import {eased} from "../lib/motion";

export const ConfigureScene = () => {
  const frame = useCurrentFrame();
  const popupScale = eased(frame, [0, 199], [1.23, 1.3]);
  const popupX = eased(frame, [0, 199], [22, -10]);
  const mistype = frame >= 92 ? 2 : 0;
  const speed = frame >= 50 ? "fast" : "normal";
  const target = frame >= 132 ? "5m" : "Off";

  return (
    <AbsoluteFill className="film">
      <div className="film-grid" />
      <div className="film-beam film-beam-right" />
      <FilmCaption
        step="02"
        kicker="Set your controls"
        title="Choose the pace before it starts."
        copy="Speed, optional corrections, and a target time stay in your control."
        style={{top: 120}}
      />
      <GoogleDocs
        style={{
          left: 62,
          top: 450,
          opacity: 0.46,
          rotate: "-2deg",
          scale: 0.69,
          transformOrigin: "top left",
        }}
      />
      <AutoTyperPopup
        mistype={mistype}
        speed={speed}
        state="ready"
        target={target}
        style={{
          left: 1230,
          top: 76,
          scale: popupScale,
          translate: `${popupX}px 0`,
          transformOrigin: "top left",
        }}
      />
      <Pointer
        clickFrames={[50, 92, 132, 177]}
        points={[
          {frame: 8, x: 1770, y: 310},
          {frame: 42, x: 1680, y: 399},
          {frame: 50, x: 1680, y: 399},
          {frame: 77, x: 1410, y: 552},
          {frame: 92, x: 1532, y: 552},
          {frame: 118, x: 1405, y: 689},
          {frame: 132, x: 1405, y: 689},
          {frame: 162, x: 1500, y: 829},
          {frame: 177, x: 1500, y: 829},
          {frame: 195, x: 1500, y: 829},
        ]}
        visibleFrom={6}
        visibleUntil={198}
      />
      <DemoPill />
    </AbsoluteFill>
  );
};
