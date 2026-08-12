import {AbsoluteFill, useCurrentFrame} from "remotion";
import {AutoTyperPopup} from "../components/AutoTyperPopup";
import {DemoPill, FilmCaption} from "../components/FilmCaption";
import {GoogleDocs} from "../components/GoogleDocs";
import {Pointer} from "../components/Pointer";
import {eased} from "../lib/motion";

export const SelectTextScene = () => {
  const frame = useCurrentFrame();
  const popupOpacity = eased(frame, [0, 15], [0, 1]);
  const popupX = eased(frame, [0, 24], [56, 0]);
  const popupScale = eased(frame, [0, 24], [0.965, 1]);
  const browserScale = eased(frame, [0, 90], [0.68, 0.71]);

  return (
    <AbsoluteFill className="film">
      <FilmCaption
        kicker="Auto Typer"
        title="Choose your reviewed text."
        copy="The same drafts you send from Bipass AI are ready inside the extension."
      />
      <GoogleDocs
        style={{
          left: 74,
          top: 334,
          opacity: 0.72,
          rotate: "-1.6deg",
          scale: browserScale,
          transformOrigin: "top left",
        }}
      />
      <AutoTyperPopup
        selectedIndex={frame >= 74 ? 0 : null}
        state="list"
        style={{
          left: 1072,
          top: 112,
          opacity: popupOpacity,
          scale: popupScale,
          translate: `${popupX}px 0`,
        }}
      />
      <Pointer
        clickFrames={[74]}
        points={[
          {frame: 12, x: 1490, y: 250},
          {frame: 57, x: 1255, y: 245},
          {frame: 74, x: 1255, y: 245},
          {frame: 96, x: 1255, y: 245},
        ]}
        visibleFrom={10}
        visibleUntil={102}
      />
      <DemoPill />
    </AbsoluteFill>
  );
};
