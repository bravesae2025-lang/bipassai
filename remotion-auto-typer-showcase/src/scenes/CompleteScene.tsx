import {AbsoluteFill, useCurrentFrame} from "remotion";
import {DemoPill, FilmCaption} from "../components/FilmCaption";
import {GoogleDocs} from "../components/GoogleDocs";
import {eased} from "../lib/motion";

const finalText = "Clear writing makes complex ideas easier to understand. Technology can support the work, while your judgment shapes the final draft.";

export const CompleteScene = () => {
  const frame = useCurrentFrame();
  const browserScale = eased(frame, [0, 109], [0.98, 0.92]);
  const browserX = eased(frame, [0, 109], [598, 650]);
  const doneOpacity = eased(frame, [18, 38], [0, 1]);
  const doneY = eased(frame, [18, 46], [18, 0]);

  return (
    <AbsoluteFill className="film">
      <div className="film-grid" />
      <div className="film-beam" />
      <FilmCaption
        step="04"
        kicker="Done"
        title="A complete, editable draft."
        copy="Review it in the document and keep working like normal."
        style={{top: 258, width: 440}}
      />
      <GoogleDocs
        floatState="paused"
        text={finalText}
        style={{
          left: browserX,
          top: 148,
          scale: browserScale,
          transformOrigin: "top left",
        }}
      />
      <div className="film-done" style={{opacity: doneOpacity, translate: `0 ${doneY}px`}}>
        <span>✓</span> Draft complete
      </div>
      <DemoPill />
    </AbsoluteFill>
  );
};
