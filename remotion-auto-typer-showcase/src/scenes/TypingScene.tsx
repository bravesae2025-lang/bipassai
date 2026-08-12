import {AbsoluteFill, useCurrentFrame} from "remotion";
import {AutoTyperPopup} from "../components/AutoTyperPopup";
import {DemoPill, FilmCaption} from "../components/FilmCaption";
import {FloatState, GoogleDocs} from "../components/GoogleDocs";
import {Pointer} from "../components/Pointer";
import {eased, linear} from "../lib/motion";

const prefix = "Clear writing makes complex ideas easier to understand. ";
const remainder = "Technology can support the work, while your judgment shapes the final draft.";

const getTypedText = (frame: number) => {
  if (frame < 61) return "";
  if (frame < 102) {
    return prefix.slice(0, Math.floor(linear(frame, [61, 101], [0, prefix.length])));
  }
  if (frame < 123) return prefix;
  if (frame < 128) return `${prefix}${"Teh".slice(0, Math.floor(linear(frame, [123, 127], [1, 3])))}`;
  if (frame < 132) return `${prefix}Te`;
  if (frame < 136) return `${prefix}T`;
  if (frame < 140) return prefix;
  return `${prefix}${remainder.slice(0, Math.floor(linear(frame, [140, 178], [0, remainder.length])))}`;
};

export const TypingScene = () => {
  const frame = useCurrentFrame();
  const armedOpacity = eased(frame, [0, 8, 31, 41], [0, 1, 1, 0]);
  const armedY = eased(frame, [25, 42], [0, -38]);
  const browserScale = eased(frame, [0, 52, 178], [0.75, 0.78, 0.81]);
  const browserX = eased(frame, [0, 178], [255, 160]);
  const floatOpacity = eased(frame, [31, 43], [0, 1]);
  const floatState: FloatState =
    frame < 31
      ? "hidden"
      : frame < 61
        ? "start"
        : frame < 104
          ? "typing"
          : frame < 123
            ? "paused"
            : "typing";
  const typedText = getTypedText(frame);

  return (
    <AbsoluteFill className="film">
      <FilmCaption
        kicker="Where you work"
        title="Start. Pause. Continue."
        copy="Type character by character into Google Docs, with a control that stays within reach."
        style={{top: 54}}
      />
      <GoogleDocs
        floatOpacity={floatOpacity}
        floatState={floatState}
        showCaret={frame >= 39}
        showFocus={frame >= 34 && frame < 56}
        text={typedText}
        style={{
          left: browserX,
          top: 305,
          scale: browserScale,
          transformOrigin: "top left",
        }}
      />
      <AutoTyperPopup
        mistype={2}
        speed="fast"
        state="armed"
        target="5m"
        style={{
          left: 1102,
          top: 128,
          opacity: armedOpacity,
          scale: 0.82,
          translate: `0 ${armedY}px`,
          transformOrigin: "top right",
        }}
      />
      <Pointer
        clickFrames={[39, 61, 104, 123]}
        points={[
          {frame: 15, x: 1400, y: 280},
          {frame: 34, x: 720, y: 580},
          {frame: 39, x: 720, y: 580},
          {frame: 55, x: 1138, y: 837},
          {frame: 61, x: 1138, y: 837},
          {frame: 97, x: 1134, y: 842},
          {frame: 104, x: 1134, y: 842},
          {frame: 118, x: 1130, y: 844},
          {frame: 123, x: 1130, y: 844},
          {frame: 142, x: 1160, y: 850},
        ]}
        visibleFrom={12}
        visibleUntil={147}
      />
      <DemoPill />
    </AbsoluteFill>
  );
};
