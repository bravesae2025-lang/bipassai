import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
} from "remotion";
import {Pointer} from "./components/Pointer";

const sourceText =
  "Physical activity is important for students because it helps them stay focused during class and manage stress. Regular movement can also improve sleep, energy, and confidence over time.";

const resultParts = [
  ["Physical activity is ", ""],
  ["really useful", "guide-change guide-change-word"],
  [" for students because it helps them ", ""],
  ["focus better", "guide-change guide-change-structure"],
  [" in class and deal with stress. Moving regularly can also improve sleep, energy, and confidence ", ""],
  ["over time", "guide-change guide-change-tone"],
  [".", ""],
] as const;

const stepFrames = [0, 125, 205, 320, 458, 600];
const stepNames = ["Paste", "Choose", "Match", "Review", "Auto Type"];

const wordLines = (text: string) => text.split(" ");

const BrandMark = () => (
  <div className="guide-brand-mark" aria-hidden="true">
    <i />
    <i />
    <i />
    <i />
    <i />
  </div>
);

const BrowserChrome = () => (
  <>
    <div className="guide-browser-bar">
      <div className="guide-browser-dots"><i /><i /><i /></div>
      <div className="guide-browser-address">
        <span className="guide-browser-lock">⌁</span>
        bipassai.com/home
      </div>
      <div className="guide-browser-actions">•••</div>
    </div>
    <div className="guide-site-nav">
      <div className="guide-logo"><BrandMark /> BIPASS AI</div>
      <div className="guide-nav-links"><span>History</span><span>Plans</span><span>Settings</span></div>
      <div className="guide-credits"><b>1,840</b> credits</div>
      <div className="guide-avatar">S</div>
    </div>
  </>
);

const StylePanel = ({frame}: {readonly frame: number}) => {
  const selected = frame >= 154;
  return (
    <div className="guide-style-panel">
      <div className="guide-panel-label">STYLES</div>
      <div className="guide-profile-option">
        <BrandMark />
        <div><strong>School essays</strong><small>3 saved profiles</small></div>
        <span>SELECT</span>
      </div>
      <div className="guide-or"><i />OR<i /></div>
      <div className="guide-level-track">
        <div
          className="guide-level-glider"
          style={{
            opacity: interpolate(frame, [136, 154], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            translate: interpolate(frame, [136, 154], ["0px 0px", "160px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        />
        <span>Beginner</span><span className={selected ? "is-selected" : ""}>Student</span><span>Academic</span><span>Custom</span>
      </div>
      <div className="guide-level-detail">
        <div className="guide-detail-head"><span>Student level</span><b>{selected ? "SELECTED" : "READY"}</b></div>
        <div className="guide-detail-row"><span>Vocabulary</span><i><b style={{width: `${interpolate(frame, [148, 170], [0, 56], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1)})}%`}} /></i><em>Natural</em></div>
        <div className="guide-detail-row"><span>Sentence flow</span><i><b style={{width: `${interpolate(frame, [151, 173], [0, 62], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1)})}%`}} /></i><em>Varied</em></div>
        <div className="guide-detail-row"><span>Grammar</span><i><b style={{width: `${interpolate(frame, [154, 176], [0, 18], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1)})}%`}} /></i><em>Clean</em></div>
      </div>
      <div className="guide-profile-list-label">MY PROFILES</div>
      <div className="guide-mini-profile"><BrandMark /><strong>School essays</strong><span>Use</span></div>
      <div className="guide-mini-profile"><BrandMark /><strong>Lab reports</strong><span>Use</span></div>
    </div>
  );
};

const InputWorkspace = ({frame}: {readonly frame: number}) => {
  const typedCount = Math.floor(interpolate(frame, [28, 112], [0, sourceText.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const typed = sourceText.slice(0, typedCount);
  const processing = frame >= 222 && frame < 320;
  const processingProgress = interpolate(frame, [222, 314], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });
  const phase = processingProgress < 34 ? "Reading your draft" : processingProgress < 72 ? "Matching Student level" : "Preparing changes";

  return (
    <div className="guide-workspace-pane">
      <div className="guide-mode-row">
        <div><span>WORKFLOW</span><strong>Level Matching Only</strong></div>
        <span className="guide-word-count">{typed ? wordLines(typed).length : 0} words</span>
      </div>
      <div className="guide-upload-row"><span>＋ Upload document</span><small>PDF · DOCX · TXT</small></div>
      <div className="guide-textarea">
        {typed || <span className="guide-placeholder">Paste text to match its writing level…</span>}
        {frame < 120 ? <i className="guide-caret" /> : null}
      </div>
      <div className="guide-quality-row"><span><i /> Meaning protected</span><span><i /> Sentence structure locked</span></div>
      <button className={frame >= 214 && frame < 226 ? "guide-match-button is-pressed" : "guide-match-button"}>
        <span>MATCH LEVEL</span><b>→</b>
      </button>
      {processing ? (
        <div className="guide-processing">
          <div className="guide-processing-card">
            <div className="guide-processing-top"><BrandMark /><span>{phase}</span><b>{Math.round(processingProgress)}%</b></div>
            <div className="guide-processing-track"><i style={{width: `${processingProgress}%`}} /></div>
            <div className="guide-processing-stages"><span className="done">READ</span><span className={processingProgress > 34 ? "done" : ""}>MATCH</span><span className={processingProgress > 72 ? "done" : ""}>FINAL</span></div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const ResultWorkspace = ({frame}: {readonly frame: number}) => {
  const reveal = interpolate(frame, [320, 342], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  return (
    <div className="guide-result-pane" style={{opacity: reveal, translate: `${(1 - reveal) * 22}px 0px`}}>
      <div className="guide-result-header">
        <div><span>RESULT</span><strong>Level-matched draft</strong></div>
        <div className="guide-result-meta"><span>Student</span><span>29 words</span><button>Copy</button></div>
      </div>
      <div className="guide-result-body">
        <p>{resultParts.map(([text, className], index) => <span className={className} key={index}>{text}</span>)}</p>
        <div className="guide-change-legend"><span><i className="word" />Vocabulary</span><span><i className="structure" />Structure</span><span><i className="tone" />Tone</span></div>
      </div>
      <div className="guide-result-footer">
        <button className="guide-secondary-button">← Adjust level</button>
        <button className={frame >= 426 && frame < 438 ? "guide-upload-button is-pressed" : "guide-upload-button"}>
          <span>Upload to Auto Typer</span><b>↗</b>
        </button>
      </div>
    </div>
  );
};

const DocsWorkspace = ({frame}: {readonly frame: number}) => {
  const docText = "Physical activity is really useful for students because it helps them focus better in class and deal with stress. Moving regularly can also improve sleep, energy, and confidence over time.";
  const typedCount = Math.floor(interpolate(frame, [492, 576], [0, docText.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const complete = frame >= 576;
  return (
    <div className="guide-docs-pane">
      <div className="guide-docs-topbar">
        <div className="guide-doc-icon">▤</div>
        <div><strong>Physical activity draft</strong><span>Saved to Drive</span></div>
        <div className="guide-docs-actions"><span>Share</span><div>S</div></div>
      </div>
      <div className="guide-docs-menu"><span>File</span><span>Edit</span><span>View</span><span>Insert</span><span>Format</span><span>Tools</span><span>Help</span></div>
      <div className="guide-docs-toolbar"><span>↶</span><span>↷</span><i /><b>100%</b><i /><b>Normal text</b><i /><b>Arial</b><i /><b>11</b></div>
      <div className="guide-docs-canvas">
        <div className="guide-doc-page">
          <div className="guide-doc-title">Why movement matters for students</div>
          <p>{docText.slice(0, typedCount)}{!complete ? <i className="guide-doc-caret" /> : null}</p>
        </div>
      </div>
      <div className={complete ? "guide-autotyper-pill is-complete" : "guide-autotyper-pill"}>
        <BrandMark />
        <div><strong>{complete ? "Typing complete" : "Auto Typing"}</strong><span>{complete ? "173 characters" : "Natural pace · Student draft"}</span></div>
        <b>{complete ? "✓" : "Ⅱ"}</b>
      </div>
    </div>
  );
};

const StepRail = ({frame}: {readonly frame: number}) => {
  const active = Math.min(stepNames.length - 1, stepFrames.findIndex((end, index) => index > 0 && frame < end) - 1);
  const safeActive = active < 0 ? stepNames.length - 1 : active;
  return (
    <div className="guide-step-rail">
      {stepNames.map((name, index) => {
        const start = stepFrames[index];
        const end = stepFrames[index + 1];
        const progress = interpolate(frame, [start, end], [0, 100], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div className={index === safeActive ? "guide-step is-active" : index < safeActive ? "guide-step is-done" : "guide-step"} key={name}>
            <div><b>{String(index + 1).padStart(2, "0")}</b><span>{name}</span></div>
            <i><b style={{width: `${index < safeActive ? 100 : index === safeActive ? progress : 0}%`}} /></i>
          </div>
        );
      })}
    </div>
  );
};

export const LevelMatchingGuide = () => {
  const frame = useCurrentFrame();
  const showResult = frame >= 320;
  const showDocs = frame >= 458;
  const windowOpacity = interpolate(frame, [0, 18, 590, 599], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: [Easing.bezier(0.16, 1, 0.3, 1), Easing.linear, Easing.bezier(0.4, 0, 1, 1)],
  });
  const appOpacity = interpolate(frame, [458, 488], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const docsOpacity = interpolate(frame, [464, 494], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <AbsoluteFill className="level-guide-film">
      <div className="level-guide-grid" />
      <Interactive.Div name="Workflow label" className="guide-film-label">
        <BrandMark /><span>LEVEL MATCHING</span><i />WORKFLOW
      </Interactive.Div>
      <Interactive.Div
        name="Product window"
        className="guide-browser"
        style={{
          opacity: windowOpacity,
          scale: interpolate(frame, [0, 24], [0.975, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({damping: 200}),
            output: "perceptual-scale",
          }),
        }}
      >
        <BrowserChrome />
        <div className="guide-app-area" style={{opacity: appOpacity}}>
          {showResult ? <ResultWorkspace frame={frame} /> : <InputWorkspace frame={frame} />}
          <StylePanel frame={frame} />
        </div>
        {showDocs ? <div style={{opacity: docsOpacity}}><DocsWorkspace frame={frame} /></div> : null}
      </Interactive.Div>
      {!showDocs ? (
        <Pointer
          clickFrames={[154, 218, 432]}
          points={[
            {frame: 18, x: 700, y: 525},
            {frame: 112, x: 700, y: 525},
            {frame: 136, x: 1878, y: 490},
            {frame: 154, x: 1878, y: 490},
            {frame: 178, x: 1878, y: 490},
            {frame: 202, x: 1020, y: 1114},
            {frame: 218, x: 1020, y: 1114},
            {frame: 252, x: 1020, y: 1114},
            {frame: 338, x: 1100, y: 685},
            {frame: 405, x: 1100, y: 685},
            {frame: 422, x: 1190, y: 1120},
            {frame: 432, x: 1190, y: 1120},
            {frame: 456, x: 1190, y: 1120},
          ]}
          visibleFrom={14}
          visibleUntil={464}
        />
      ) : null}
      <StepRail frame={frame} />
    </AbsoluteFill>
  );
};
