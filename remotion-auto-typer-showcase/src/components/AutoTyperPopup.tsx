import {useCurrentFrame} from "remotion";
import {linear} from "../lib/motion";

export type PopupState = "list" | "ready" | "armed";
export type TypingSpeed = "slow" | "normal" | "fast";

type AutoTyperPopupProps = {
  readonly state: PopupState;
  readonly speed?: TypingSpeed;
  readonly mistype?: 0 | 1 | 2 | 3 | 4;
  readonly target?: "Off" | "5m" | "10m" | "20m";
  readonly selectedIndex?: number | null;
  readonly style?: React.CSSProperties;
};

const savedTexts = [
  {
    badge: "Humanized · Student",
    date: "Aug 12, 2026",
    copy: "Clear writing makes complex ideas easier to understand. Technology can support the work, while your judgment shapes the final draft.",
  },
  {
    badge: "Generated · Academic",
    date: "Aug 11, 2026",
    copy: "Digital tools are most valuable when they support careful research, deliberate revision, and a writer's own decisions.",
  },
  {
    badge: "Humanized · Beginner",
    date: "Aug 9, 2026",
    copy: "Good ideas become easier to follow when the writing is simple, direct, and reviewed one sentence at a time.",
  },
] as const;

const mistypeLabels = ["None", "A little", "Some", "More", "A lot"] as const;

const AccountFooter = () => (
  <div className="at-account">
    <div className="at-account-user">
      <span className="at-avatar">B</span>
      bravesaeng
    </div>
    <span className="at-signout">Sign out</span>
  </div>
);

export const AutoTyperPopup = ({
  state,
  speed = "normal",
  mistype = 0,
  target = "Off",
  selectedIndex = null,
  style,
}: AutoTyperPopupProps) => {
  const frame = useCurrentFrame();
  const sheen = linear(frame % 150, [0, 82, 149], [-45, 125, 125]);
  const radarScale = linear(frame % 54, [0, 53], [0.55, 2.15]);
  const radarOpacity = linear(frame % 54, [0, 53], [0.78, 0]);

  return (
    <div className="at-popup" style={style}>
      <div className="at-header">
        <span
          style={{
            position: "absolute",
            top: 0,
            left: `${sheen}%`,
            width: "40%",
            height: 2,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,.72), transparent)",
          }}
        />
        <span className="at-header-logo">
          <span className="at-mark" />
          Bipass AI
        </span>
        <span className="at-tag">Auto Typer</span>
      </div>

      {state === "list" ? (
        <div className="at-body">
          <div className="at-list-head">
            <span className="at-mono-label">Your texts</span>
            <span className="at-list-hint">Choose one to type</span>
          </div>
          <div className="at-result-list">
            {savedTexts.map((result, index) => (
              <div
                className={`at-result${selectedIndex === index ? " selected" : ""}`}
                key={result.date}
              >
                <div className="at-result-meta">
                  <span className="at-result-badge">{result.badge}</span>
                  <span className="at-result-date">{result.date}</span>
                </div>
                <div className="at-result-copy">{result.copy}</div>
              </div>
            ))}
          </div>
          <AccountFooter />
        </div>
      ) : null}

      {state === "ready" ? (
        <div className="at-body" style={{gap: 10}}>
          <div className="at-text-card">
            <div className="at-text-head">
              <span className="at-back">← Back</span>
              <span className="at-text-meta">
                19 words <span>·</span> <span className="at-mode">Humanized</span>
              </span>
            </div>
            <div className="at-preview">{savedTexts[0].copy}</div>
          </div>

          <div className="at-panel at-panel-controls">
            <span className="at-label">Typing Speed</span>
            <div className="at-segments">
              {(["slow", "normal", "fast"] as const).map((option) => (
                <span
                  className={`at-segment${speed === option ? " active" : ""}`}
                  key={option}
                >
                  {option[0].toUpperCase() + option.slice(1)}
                </span>
              ))}
            </div>
            <div className="at-separator" />
            <span className="at-label">Mistyping&nbsp; ⓘ</span>
            <div className="at-slider-row">
              <span className="at-slider">
                <span className="at-slider-fill" style={{width: `${mistype * 25}%`}} />
                <span className="at-slider-knob" style={{left: `${mistype * 25}%`}} />
              </span>
              <span className="at-slider-value">{mistypeLabels[mistype]}</span>
            </div>
          </div>

          <div className="at-panel at-panel-time">
            <span className="at-label">Target Time</span>
            <div className="at-segments">
              {(["Off", "5m", "10m", "20m"] as const).map((option) => (
                <span
                  className={`at-segment${target === option ? " active" : ""}`}
                  key={option}
                >
                  {option}
                </span>
              ))}
            </div>
          </div>

          <span className="at-start">Start Typing <span>→</span></span>
          <div className="at-hint">
            <span>▶</span>
            <span>
              Switch to the page where you want to type. Click into the text field,
              then press the <strong>▶ button</strong>.
            </span>
          </div>
          <AccountFooter />
        </div>
      ) : null}

      {state === "armed" ? (
        <div className="at-body">
          <div className="at-armed">
            <div className="at-radar">
              <span
                className="at-radar-ring"
                style={{scale: radarScale, opacity: radarOpacity}}
              />
              <span className="at-radar-dot" />
            </div>
            <div className="at-armed-title">Ready to type</div>
            <div className="at-armed-copy">
              Switch to your target page.<br />
              Click into the text field, then press the <strong>▶</strong> button.
            </div>
            <span className="at-cancel">Cancel</span>
          </div>
          <AccountFooter />
        </div>
      ) : null}
    </div>
  );
};
