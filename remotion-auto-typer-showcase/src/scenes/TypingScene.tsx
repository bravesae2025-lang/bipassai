import {AbsoluteFill, useCurrentFrame} from "remotion";
import {AutoTyperPopup} from "../components/AutoTyperPopup";
import {DemoPill, FilmCaption} from "../components/FilmCaption";
import {FloatState, GoogleDocs} from "../components/GoogleDocs";
import {Pointer} from "../components/Pointer";
import {eased, linear} from "../lib/motion";

const prefix = "Clear writing makes complex ideas easier to understand. ";
const remainder = "Technology can support the work, while your judgment shapes the final draft.";

const typedChunk = (frame: number, from: number, to: number, text: string) =>
  text.slice(0, Math.floor(linear(frame, [from, to], [0, text.length])));

const getTypedText = (frame: number) => {
  if (frame < 92) return "";
  if (frame < 166) return typedChunk(frame, 92, 165, prefix);
  if (frame < 202) return prefix;
  if (frame < 214) return `${prefix}${typedChunk(frame, 202, 213, "Teh")}`;
  if (frame < 220) return `${prefix}Te`;
  if (frame < 226) return `${prefix}T`;
  if (frame < 232) return prefix;
  return `${prefix}${typedChunk(frame, 232, 296, remainder)}`;
};

export const TypingScene = () => {
  const frame = useCurrentFrame();
  const armedOpacity = eased(frame, [0, 12, 52, 72], [0, 1, 1, 0]);
  const armedY = eased(frame, [45, 74], [0, -56]);
  const browserScale = eased(frame, [0, 70, 299], [1.13, 1.2, 1.23]);
  const browserX = eased(frame, [0, 299], [208, 155]);
  const browserY = eased(frame, [0, 299], [142, 116]);
  const floatOpacity = eased(frame, [55, 78], [0, 1]);
  const floatState: FloatState =
    frame < 55
      ? "hidden"
      : frame < 92
        ? "start"
        : frame < 166
          ? "typing"
          : frame < 192
            ? "paused"
            : "typing";

  return (
    <AbsoluteFill className="film">
      <div className="film-grid" />
      <FilmCaption
        compact
        step="03"
        kicker="Type in Google Docs"
        title="Start. Stop. Continue."
        copy="The floating control stays within reach while each character is typed."
        style={{top: 40, left: 70, width: 820}}
      />
      <GoogleDocs
        floatOpacity={floatOpacity}
        floatState={floatState}
        showCaret={frame >= 72}
        showFocus={frame >= 58 && frame < 88}
        text={getTypedText(frame)}
        style={{
          left: browserX,
          top: browserY,
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
          left: 1370,
          top: 98,
          opacity: armedOpacity,
          scale: 0.92,
          translate: `0 ${armedY}px`,
          transformOrigin: "top right",
        }}
      />
      <Pointer
        clickFrames={[66, 92, 166, 192]}
        points={[
          {frame: 15, x: 1580, y: 300},
          {frame: 58, x: 670, y: 575},
          {frame: 66, x: 670, y: 575},
          {frame: 82, x: 1535, y: 936},
          {frame: 92, x: 1535, y: 936},
          {frame: 154, x: 1535, y: 936},
          {frame: 166, x: 1535, y: 936},
          {frame: 184, x: 1535, y: 936},
          {frame: 192, x: 1535, y: 936},
          {frame: 222, x: 830, y: 645},
          {frame: 285, x: 1040, y: 664},
        ]}
        visibleFrom={12}
        visibleUntil={292}
      />
      <DemoPill />
    </AbsoluteFill>
  );
};
