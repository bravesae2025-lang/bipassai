import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from "remotion";
import {FilmCaption} from "../components/FilmCaption";
import {FloatState, GoogleDocs} from "../components/GoogleDocs";
import {Pointer} from "../components/Pointer";

const finalText = "Clear writing makes ideas easier to follow. Your judgment shapes the final draft.";

const getTypedText = (frame: number) => {
  const characters = Math.floor(
    interpolate(frame, [230, 780], [0, finalText.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  return finalText.slice(0, characters);
};

export const TypingScene = () => {
  const frame = useCurrentFrame();
  const documentScale = interpolate(frame, [0, 839], [0.975, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const floatState: FloatState = frame < 145 ? "hidden" : frame < 220 ? "start" : "typing";
  const floatOpacity = interpolate(frame, [145, 174], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="scene">
      <FilmCaption
        kicker="03 · Type in the document"
        title="Click once. Keep writing."
        copy="The floating control stays close while every character lands at a readable pace."
        fadeOutFrom={168}
        style={{left: 76, top: 58, width: 780}}
      />
      <GoogleDocs
        floatOpacity={floatOpacity}
        floatState={floatState}
        showCaret={frame >= 112}
        showFocus={frame >= 100 && frame < 144}
        text={getTypedText(frame)}
        style={{
          left: 320,
          top: 230,
          scale: documentScale,
          transformOrigin: "top left",
        }}
      />
      <Pointer
        clickFrames={[112, 220]}
        points={[
          {frame: 48, x: 860, y: 225},
          {frame: 96, x: 438, y: 506},
          {frame: 112, x: 438, y: 506},
          {frame: 156, x: 438, y: 506},
          {frame: 202, x: 1436, y: 954},
          {frame: 220, x: 1436, y: 954},
          {frame: 268, x: 1436, y: 954},
          {frame: 620, x: 985, y: 544},
        ]}
        visibleFrom={42}
        visibleUntil={650}
      />
    </AbsoluteFill>
  );
};
