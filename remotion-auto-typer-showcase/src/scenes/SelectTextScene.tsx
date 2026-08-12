import {AbsoluteFill, useCurrentFrame} from "remotion";
import {AutoTyperPopup} from "../components/AutoTyperPopup";
import {DemoPill, FilmCaption} from "../components/FilmCaption";
import {GoogleDocs} from "../components/GoogleDocs";
import {Pointer} from "../components/Pointer";
import {eased} from "../lib/motion";

export const SelectTextScene = () => {
  const frame = useCurrentFrame();
  const popupOpacity = eased(frame, [0, 22], [0, 1]);
  const popupX = eased(frame, [0, 40, 149], [100, 0, -16]);
  const popupScale = eased(frame, [0, 42, 149], [1.16, 1.25, 1.27]);
  const browserScale = eased(frame, [0, 149], [0.69, 0.72]);
  const selectedIndex = frame >= 108 ? 0 : null;

  return (
    <AbsoluteFill className="film">
      <div className="film-grid" />
      <div className="film-beam" />
      <FilmCaption
        step="01"
        kicker="Choose a draft"
        title="Your reviewed text is ready."
        copy="Open the extension and pick the draft you want to type."
      />
      <GoogleDocs
        style={{
          left: 86,
          top: 370,
          opacity: 0.52,
          rotate: "-1.7deg",
          scale: browserScale,
          transformOrigin: "top left",
        }}
      />
      <AutoTyperPopup
        selectedIndex={selectedIndex}
        state="list"
        style={{
          left: 1284,
          top: 116,
          opacity: popupOpacity,
          scale: popupScale,
          translate: `${popupX}px 0`,
          transformOrigin: "top left",
        }}
      />
      <Pointer
        clickFrames={[108]}
        points={[
          {frame: 22, x: 1770, y: 160},
          {frame: 78, x: 1528, y: 295},
          {frame: 108, x: 1528, y: 295},
          {frame: 140, x: 1528, y: 295},
        ]}
        visibleFrom={18}
        visibleUntil={146}
      />
      <DemoPill />
    </AbsoluteFill>
  );
};
