import {AbsoluteFill, useCurrentFrame} from "remotion";
import {DemoPill, FilmCaption} from "../components/FilmCaption";
import {GoogleDocs} from "../components/GoogleDocs";
import {eased} from "../lib/motion";

const finalText = "Clear writing makes complex ideas easier to understand. Technology can support the work, while your judgment shapes the final draft.";

export const CompleteScene = () => {
  const frame = useCurrentFrame();
  const browserScale = eased(frame, [0, 74], [1.01, 0.93]);
  const browserX = eased(frame, [0, 74], [-18, 350]);

  return (
    <AbsoluteFill className="film">
      <FilmCaption
        kicker="Always yours"
        title="You stay in control."
        copy="Your text, your pace, and a final result you can stop and review whenever you want."
        style={{top: 210, width: 430}}
      />
      <GoogleDocs
        text={finalText}
        style={{
          left: browserX,
          top: 103,
          scale: browserScale,
          transformOrigin: "top left",
        }}
      />
      <DemoPill />
    </AbsoluteFill>
  );
};
