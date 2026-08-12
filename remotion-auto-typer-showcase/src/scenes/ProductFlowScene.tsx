import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from "remotion";
import {AutoTyperPopup} from "../components/AutoTyperPopup";
import {GoogleDocs} from "../components/GoogleDocs";
import {Pointer} from "../components/Pointer";

const finalText = "Clear writing makes ideas easier to follow. Your judgment shapes the final draft.";
const smooth = Easing.bezier(0.16, 1, 0.3, 1);

const fadeWindow = (
  frame: number,
  fadeInStart: number,
  fadeInEnd: number,
  fadeOutStart: number,
  fadeOutEnd: number,
) =>
  interpolate(
    frame,
    [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd],
    [0, 1, 1, 0],
    {
      easing: [smooth, Easing.linear, Easing.bezier(0.4, 0, 1, 1)],
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

const FlowCaption = ({
  frame,
  step,
  title,
  range,
}: {
  readonly frame: number;
  readonly step: string;
  readonly title: string;
  readonly range: readonly [number, number, number, number];
}) => (
  <div
    className="flow-caption"
    style={{
      opacity: fadeWindow(frame, ...range),
      translate: interpolate(frame, [range[0], range[1]], ["0px 18px", "0px 0px"], {
        easing: smooth,
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    }}
  >
    <span>{step}</span>
    <h2>{title}</h2>
  </div>
);

const typedTextAt = (frame: number) => {
  const count = Math.floor(
    interpolate(frame, [760, 1060], [0, finalText.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  return finalText.slice(0, count);
};

export const ProductFlowScene = () => {
  const frame = useCurrentFrame();
  const sceneOpacity = interpolate(frame, [0, 28, 1210, 1259], [0, 1, 1, 0], {
    easing: [smooth, Easing.linear, Easing.bezier(0.4, 0, 1, 1)],
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const popupMix = interpolate(frame, [270, 318], [0, 1], {
    easing: smooth,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const popupOpacity = interpolate(frame, [520, 620], [1, 0], {
    easing: smooth,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const docLeft = interpolate(frame, [0, 520, 650, 1080, 1185], [70, 70, 320, 320, 86], {
    easing: [Easing.linear, smooth, Easing.linear, smooth],
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const docTop = interpolate(frame, [0, 520, 650, 1080, 1185], [422, 422, 230, 230, 176], {
    easing: [Easing.linear, smooth, Easing.linear, smooth],
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const docScale = interpolate(frame, [0, 520, 650, 1080, 1185], [0.68, 0.68, 0.985, 1, 0.7], {
    easing: [Easing.linear, smooth, Easing.linear, smooth],
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    output: "perceptual-scale",
  });
  const docOpacity = interpolate(frame, [500, 640], [0.38, 1], {
    easing: smooth,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const floatOpacity = interpolate(frame, [650, 685, 1080, 1120], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const floatState = frame < 650 ? "hidden" : frame < 745 ? "start" : "typing";
  const outroOpacity = interpolate(frame, [1115, 1170], [0, 1], {
    easing: smooth,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="scene product-flow" style={{opacity: sceneOpacity}}>
      <FlowCaption frame={frame} range={[0, 34, 238, 266]} step="01 / CHOOSE" title="Choose a draft." />
      <FlowCaption frame={frame} range={[276, 310, 494, 522]} step="02 / PACE" title="Set the pace." />
      <FlowCaption frame={frame} range={[554, 594, 690, 722]} step="03 / TYPE" title="Type in your document." />

      <GoogleDocs
        floatOpacity={floatOpacity}
        floatState={floatState}
        showCaret={frame >= 640}
        showFocus={frame >= 625 && frame < 670}
        text={typedTextAt(frame)}
        style={{
          left: docLeft,
          top: docTop,
          opacity: docOpacity,
          scale: docScale,
          transformOrigin: "top left",
        }}
      />

      <AutoTyperPopup
        contentMix={popupMix}
        selected={frame >= 210}
        speed={frame >= 390 ? "normal" : "slow"}
        startPressed={frame >= 506 && frame < 516}
        state="list"
        style={{
          left: interpolate(frame, [520, 620], [1260, 1450], {
            easing: smooth,
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          top: 100,
          opacity: popupOpacity,
          scale: interpolate(frame, [520, 620], [1.08, 0.98], {
            easing: smooth,
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            output: "perceptual-scale",
          }),
          transformOrigin: "top left",
        }}
      />

      <Pointer
        clickFrames={[210, 390, 510, 640, 745]}
        points={[
          {frame: 70, x: 1760, y: 230},
          {frame: 174, x: 1541, y: 360},
          {frame: 210, x: 1541, y: 360},
          {frame: 330, x: 1541, y: 360},
          {frame: 370, x: 1541, y: 498},
          {frame: 390, x: 1541, y: 498},
          {frame: 450, x: 1541, y: 498},
          {frame: 492, x: 1541, y: 812},
          {frame: 510, x: 1541, y: 812},
          {frame: 570, x: 1450, y: 760},
          {frame: 620, x: 440, y: 506},
          {frame: 640, x: 440, y: 506},
          {frame: 688, x: 440, y: 506},
          {frame: 725, x: 1416, y: 942},
          {frame: 745, x: 1416, y: 942},
          {frame: 790, x: 1416, y: 942},
          {frame: 850, x: 1050, y: 590},
        ]}
        visibleFrom={62}
        visibleUntil={860}
      />

      <div className="flow-outro" style={{opacity: outroOpacity, translate: `${(1 - outroOpacity) * 28}px 0`}}>
        <span />
        <h2>Start. Pause.<br />Continue.</h2>
      </div>

      <div className="flow-brand">BIPASS AI / AUTO TYPER</div>
    </AbsoluteFill>
  );
};
