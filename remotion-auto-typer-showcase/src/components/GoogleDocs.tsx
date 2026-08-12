import {interpolate, useCurrentFrame} from "remotion";

export type FloatState = "hidden" | "start" | "typing";

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
  const caretOpacity = interpolate(frame % 48, [0, 21, 24, 47], [1, 1, 0, 0]);
  const eqHeights = [
    interpolate(frame % 32, [0, 16, 31], [5, 14, 5]),
    interpolate((frame + 10) % 32, [0, 16, 31], [6, 13, 6]),
    interpolate((frame + 20) % 32, [0, 16, 31], [4, 14, 4]),
  ];

  return (
    <div className="doc-surface" style={style}>
      <div className="doc-bar">
        <span className="doc-mark" />
        <span className="doc-name">Essay draft</span>
        <span className="doc-saved">Saved</span>
      </div>
      <div className="doc-body">
        <div className="doc-kicker">Draft 01</div>
        <h2 className="doc-title">Technology and thoughtful writing</h2>
        <p className={`doc-text${text ? "" : " doc-placeholder"}`}>
          {text || "Click here to begin writing…"}
          {showCaret ? <span className="doc-caret" style={{opacity: caretOpacity}} /> : null}
        </p>
        {showFocus ? <span className="doc-focus" /> : null}
      </div>

      {floatState === "hidden" ? null : (
        <div className="float-control" style={{opacity: floatOpacity}}>
          <span className="float-icon">
            {floatState === "typing" ? (
              <span className="float-eq">
                {eqHeights.map((height, index) => <i key={index} style={{height}} />)}
              </span>
            ) : "▶"}
          </span>
          <span>{floatState === "typing" ? "Typing" : "Start Typing"}</span>
          <span className="float-close">✕</span>
        </div>
      )}
    </div>
  );
};
