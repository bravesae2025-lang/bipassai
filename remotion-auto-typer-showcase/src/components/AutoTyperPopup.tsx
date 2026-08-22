export type PopupState = "list" | "ready";
export type TypingSpeed = "slow" | "normal" | "fast";

type AutoTyperPopupProps = {
  readonly state: PopupState;
  readonly speed?: TypingSpeed;
  readonly selected?: boolean;
  readonly contentMix?: number;
  readonly startPressed?: boolean;
  readonly style?: React.CSSProperties;
};

const savedTexts = [
  {
    badge: "Level Matched · Student",
    date: "Today",
    copy: "Clear writing makes ideas easier to follow. Your judgment shapes the final draft.",
  },
  {
    badge: "Writing Profile · Academic",
    date: "Yesterday",
    copy: "Thoughtful revision helps a writer explain complex ideas with greater precision.",
  },
  {
    badge: "Level Matched · Beginner",
    date: "Aug 10",
    copy: "Simple wording can make a strong idea easier for everyone to understand.",
  },
] as const;

export const AutoTyperPopup = ({
  state,
  speed = "normal",
  selected = false,
  contentMix,
  startPressed = false,
  style,
}: AutoTyperPopupProps) => {
  const mix = contentMix ?? (state === "ready" ? 1 : 0);

  return (
    <div className="at-popup" style={style}>
      <div className="at-header">
        <span className="at-header-logo"><i className="at-mark" /> Bipass AI</span>
        <span className="at-tag">Auto Typer</span>
      </div>

      <div
        className="at-body at-body-layer"
        style={{opacity: 1 - mix, translate: `${mix * -34}px 0`}}
      >
        <span className="at-eyebrow">Reviewed text</span>
        <h3 className="at-heading">Choose what to type</h3>
        <div className="at-list">
          {savedTexts.map((result, index) => (
            <div className={`at-result${selected && index === 0 ? " selected" : ""}`} key={result.date}>
              <div className="at-result-meta">
                <span className="at-result-badge">{result.badge}</span>
                <span className="at-result-date">{result.date}</span>
              </div>
              <div className="at-result-copy">{result.copy}</div>
              {selected && index === 0 ? <span className="at-result-check">✓</span> : null}
            </div>
          ))}
        </div>
        <div className="at-account">SIGNED IN AS BRAVESAENG</div>
      </div>

      <div
        className="at-body at-body-layer"
        style={{opacity: mix, translate: `${(1 - mix) * 34}px 0`}}
      >
        <span className="at-eyebrow">Selected draft</span>
        <h3 className="at-heading">Ready when you are</h3>
        <div className="at-preview">{savedTexts[0].copy}</div>

        <div className="at-settings">
          <span className="at-label">Typing speed</span>
          <div className="at-segments">
            {(["slow", "normal", "fast"] as const).map((option) => (
              <span className={`at-segment${speed === option ? " active" : ""}`} key={option}>
                {option[0].toUpperCase() + option.slice(1)}
              </span>
            ))}
          </div>
        </div>

        <div className="at-option-row">
          <span>Optional corrections</span>
          <span className="at-option-value">LIGHT</span>
        </div>

        <div className={`at-start${startPressed ? " pressed" : ""}`}>
          Start Typing <span aria-hidden="true">→</span>
        </div>
      </div>
    </div>
  );
};
