import {useCurrentFrame} from "remotion";
import {linear} from "../lib/motion";

export type FloatState = "hidden" | "start" | "typing" | "paused";

type GoogleDocsProps = {
  readonly text?: string;
  readonly floatState?: FloatState;
  readonly floatOpacity?: number;
  readonly showCaret?: boolean;
  readonly showFocus?: boolean;
  readonly style?: React.CSSProperties;
};

export const GoogleDocs = ({
  text = "",
  floatState = "hidden",
  floatOpacity = 1,
  showCaret = false,
  showFocus = false,
  style,
}: GoogleDocsProps) => {
  const frame = useCurrentFrame();
  const caretOpacity = linear(frame % 24, [0, 10, 12, 23], [1, 1, 0, 0]);
  const eqHeights = [
    linear(frame % 22, [0, 11, 21], [5, 14, 5]),
    linear((frame + 7) % 22, [0, 11, 21], [6, 13, 6]),
    linear((frame + 14) % 22, [0, 11, 21], [4, 14, 4]),
  ];

  const label =
    floatState === "typing"
      ? "Stop"
      : floatState === "paused"
        ? "Continue"
        : "Start Typing";

  return (
    <div className="browser" style={style}>
      <div className="browser-topbar">
        <div className="browser-dots"><span /><span /><span /></div>
        <div className="browser-address">docs.google.com/document/d/essay-draft</div>
      </div>
      <div className="docs-top">
        <div className="docs-title-row">
          <span className="docs-logo" />
          <span className="docs-file">
            <span className="docs-file-name">Essay draft</span>
            <span className="docs-menu">
              <span>File</span><span>Edit</span><span>View</span><span>Insert</span>
              <span>Format</span><span>Tools</span>
            </span>
          </span>
          <span className="docs-share">Share</span>
        </div>
        <div className="docs-toolbar">
          {Array.from({length: 6}).map((_, index) => <span className="docs-tool" key={index} />)}
        </div>
      </div>
      <div className="docs-canvas">
        <article className="docs-page">
          <h2 className="docs-page-title">Technology and thoughtful writing</h2>
          <p className={`docs-text${text ? "" : " docs-placeholder"}`}>
            {text || "Click here to begin writing…"}
            {showCaret ? <span className="docs-caret" style={{opacity: caretOpacity}} /> : null}
          </p>
        </article>
        {showFocus ? <span className="focus-halo" /> : null}
      </div>

      {floatState === "hidden" ? null : (
        <div
          className={`float-control${floatState === "typing" ? " typing" : ""}`}
          style={{opacity: floatOpacity}}
        >
          <span className="float-icon">
            {floatState === "typing" ? (
              <span className="float-eq">
                {eqHeights.map((height, index) => <i key={index} style={{height}} />)}
              </span>
            ) : "▶"}
          </span>
          <span>{label}</span>
          <span className="float-close">✕</span>
        </div>
      )}
    </div>
  );
};
