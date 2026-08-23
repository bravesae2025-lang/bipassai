import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {loadFont} from "@remotion/fonts";
import {Pointer} from "./components/Pointer";

await Promise.all([
  loadFont({family: "Bipass Display", url: staticFile("bebas-neue-latin.woff2"), weight: "400"}),
  loadFont({family: "Bipass UI", url: staticFile("syne-latin.woff2"), weight: "400"}),
  loadFont({family: "Bipass Mono", url: staticFile("dm-mono-400-latin.woff2"), weight: "400"}),
]);

const sourceText =
  "Physical activity is important for students because it helps them stay focused during class and manage stress. Regular movement can also improve sleep, energy, and confidence over time.";

const finalText =
  "Physical activity is really useful for students because it helps them focus better in class and deal with stress. Moving regularly can also improve sleep, energy, and confidence over time.";

const countWords = (text: string) => text.trim() ? text.trim().split(/\s+/).length : 0;

const Fingerprint = () => (
  <span className="real-fingerprint" aria-hidden="true">
    <i /><i /><i /><i /><i /><i />
  </span>
);

const ActionCue = ({
  frame,
  step,
  label,
  range,
}: {
  readonly frame: number;
  readonly step: string;
  readonly label: string;
  readonly range: readonly [number, number, number, number];
}) => (
  <div
    className="real-action-cue"
    style={{
      opacity: interpolate(frame, range, [0, 1, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: [Easing.bezier(0.16, 1, 0.3, 1), Easing.linear, Easing.bezier(0.4, 0, 1, 1)],
      }),
      translate: interpolate(frame, [range[0], range[1]], ["-50% -10px", "-50% 0px"], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      }),
    }}
  >
    <b>STEP {step}</b>
    <span>{label}</span>
  </div>
);

const AppNav = ({editor = false}: {readonly editor?: boolean}) => (
  <>
    <div className="real-nav">
      <div className="real-logo">BIPASS AI</div>
      {!editor ? (
        <div className="real-nav-links">
          <span>History</span><span>Plans</span><span>How to Use</span><span>Settings</span>
        </div>
      ) : <div className="real-nav-links" />}
      {!editor ? (
        <div className="real-nav-right">
          <div className="real-credit"><b>B</b><strong>1,840</strong><span>credits</span></div>
          <div className="real-extension-icon">✣</div>
          <div className="real-user">S</div>
        </div>
      ) : <div className="real-user">S</div>}
    </div>
    {!editor ? (
      <div className="real-ticker">
        <span>YOUR LEVEL, DIALED IN</span><i>✦</i><span>BEGINNER TO ACADEMIC</span><i>✦</i>
        <span>WRITING PROFILE MATCHING</span><i>✦</i><span>BUILT-IN AUTO TYPER</span><i>✦</i>
        <span>YOUR LEVEL, DIALED IN</span>
      </div>
    ) : null}
  </>
);

const StylePanel = ({frame}: {readonly frame: number}) => {
  const selected = frame >= 146;
  return (
    <div className="real-style-wrap">
      <div className="real-style-glow" />
      <div className="real-style-panel">
        <div className="real-control-head">STYLES</div>
        <div className="real-profile-choice">
          <Fingerprint />
          <div><strong>My school writing</strong><span>Writing Profile · Student</span></div>
          <b>Default</b>
        </div>
        <div className="real-or"><i /><span>OR</span><i /></div>
        <div className={selected ? "real-level-track confirmed" : "real-level-track"}>
          <span>Beginner</span>
          <span className={selected ? "selected" : ""}>Student</span>
          <span>Academic</span>
          <span>Custom</span>
          <i
            className="real-level-glider"
            style={{
              opacity: interpolate(frame, [140, 146], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.4, 0, 0.2, 1),
              }),
              translate: "128px 0px",
            }}
          />
        </div>
        <div className="real-profile-heading">MY PROFILES</div>
        <div className="real-saved-profile active"><Fingerprint /><div><strong>My school writing</strong><span>Vocabulary · Grammar · Sentence patterns</span></div><b>Using</b></div>
        <div className="real-saved-profile"><Fingerprint /><div><strong>Lab reports</strong><span>Academic · Direct · Structured</span></div><b>Use</b></div>
        <div className="real-profile-note">
          <strong>Profile analysis</strong>
          <span>Built from your past writing samples</span>
          <div><i style={{width: "72%"}} /><i style={{width: "48%"}} /><i style={{width: "61%"}} /></div>
        </div>
      </div>
    </div>
  );
};

const HomeWorkspace = ({frame}: {readonly frame: number}) => {
  const typedCount = Math.floor(interpolate(frame, [15, 90], [0, sourceText.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const typed = sourceText.slice(0, typedCount);
  return (
    <Interactive.Div
      name="Home workspace camera"
      className="real-camera"
      style={{
        scale: interpolate(frame, [0, 96, 126, 154, 176, 188], [1, 1, 1.09, 1.09, 1.02, 1.02], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          output: "perceptual-scale",
        }),
        translate: interpolate(frame, [0, 96, 126, 154, 176, 188], ["0px 0px", "0px 0px", "-225px -35px", "-225px -35px", "-30px -45px", "-30px -45px"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
      }}
    >
      <div className="real-page real-home-page">
        <AppNav />
        <div className="real-dot-field" />
        <div className="real-workspace">
          <div className="real-main-card">
            <div className="real-mode-row">
              <div className="real-mode-dropdown"><strong>LEVEL MATCHING</strong><span>⌄</span></div>
              <span className="real-wc">{countWords(typed)} words</span>
              <span className="real-cost">{countWords(typed) * 4} credits</span>
            </div>
            <div className="real-upload"><b>⇧ &nbsp;UPLOAD FILE</b><span>PDF, DOCX or TXT</span></div>
            <div className="real-input">
              {typed || <span className="real-placeholder">Paste your text here — AI-generated or your own…</span>}
              {frame < 98 ? <i className="real-caret" /> : null}
            </div>
            <div className="real-hints">
              <div><b>↓</b><strong>WORD SWAP</strong><span>Replaces AI vocabulary</span></div>
              <div><b>≈</b><strong>YOUR MEANING</strong><span>Keeps original intent</span></div>
              <div><b>✓</b><strong>LEVEL MATCH</strong><span>Sounds like your level</span></div>
            </div>
            <button className={frame >= 182 && frame < 188 ? "real-match-button pressed" : "real-match-button"}>
              <span>MATCH MY LEVEL</span><b>→</b>
            </button>
          </div>
          <StylePanel frame={frame} />
        </div>
      </div>
    </Interactive.Div>
  );
};

const LoadingScreen = ({frame}: {readonly frame: number}) => {
  const progress = interpolate(frame, [192, 250], [8, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });
  const phase = progress < 38 ? "ANALYZING" : progress < 74 ? "MATCHING LEVEL" : "PREPARING RESULT";
  const step = progress < 38 ? "01 / 03" : progress < 74 ? "02 / 03" : "03 / 03";
  return (
    <div
      className="real-loading"
      style={{
        opacity: interpolate(frame, [188, 198, 240, 250], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: [Easing.bezier(0.4, 0, 0.2, 1), Easing.linear, Easing.bezier(0.4, 0, 0.2, 1)],
        }),
      }}
    >
      <div className="real-loading-grain" />
      <div className="real-loading-inner">
        <span>{step}</span>
        <strong>{phase}</strong>
        <div className="real-loading-bar"><i style={{width: `${progress}%`}} /></div>
        <div className="real-credits-used"><b>{Math.round(interpolate(frame, [192, 250], [0, 116], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}))}</b><span>CREDITS USED</span></div>
        <button>CANCEL <b>×</b></button>
      </div>
    </div>
  );
};

const ChangePair = ({before, after, tone}: {readonly before: string; readonly after: string; readonly tone: "word" | "grammar" | "punct"}) => (
  <span className={`real-change-pair ${tone}`}><span>{before}</span><b>{after}</b></span>
);

const EditorWorkspace = ({frame}: {readonly frame: number}) => {
  const reveal = interpolate(frame, [250, 264, 360, 372], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: [Easing.bezier(0.4, 0, 0.2, 1), Easing.linear, Easing.bezier(0.4, 0, 0.2, 1)],
  });
  return (
    <Interactive.Div
      name="Editor review camera"
      className="real-camera"
      style={{
        opacity: reveal,
        scale: interpolate(frame, [250, 270, 295, 315, 345, 360, 372], [1, 1, 1.06, 1.06, 1.04, 1.04, 1.02], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          output: "perceptual-scale",
        }),
        translate: interpolate(frame, [250, 270, 295, 315, 345, 360, 372], ["0px 0px", "0px 0px", "120px 65px", "120px 65px", "-30px -30px", "-30px -30px", "0px 0px"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
      }}
    >
      <div className="real-page real-editor-page">
        <AppNav editor />
        <main className="real-editor-main">
          <div className="real-editor-wrap">
          <div className="real-editor-topbar">
            <div><span>LEVEL MATCHED</span><span>29 words</span><span>6 changes</span><span>Student</span></div>
            <button>COPY</button>
          </div>
          <div className="real-editor-layout">
            <div className="real-changes-view">
              Physical activity is <ChangePair before="important" after="really useful" tone="word" /> for students because it helps them <ChangePair before="stay focused" after="focus better" tone="grammar" /> during class and <ChangePair before="manage" after="deal with" tone="word" /> stress. <ChangePair before="Regular movement" after="Moving regularly" tone="punct" /> can also improve sleep, energy, and confidence over time.
            </div>
            <aside className="real-changes-side">
              <div className="real-filter-card">
                <strong>FILTER CHANGES</strong>
                <div><i className="word" /><span>Vocabulary</span><b>3</b><em /></div>
                <div><i className="grammar" /><span>Grammar</span><b>1</b><em /></div>
                <div><i className="punct" /><span>Punctuation</span><b>1</b><em /></div>
                <div><i className="spelling" /><span>Spelling</span><b>1</b><em /></div>
              </div>
              <div className="real-find-change">⌕ &nbsp; FIND A CHANGE <span>⌄</span></div>
              <button className={frame >= 352 && frame < 360 ? "real-editor-upload pressed" : "real-editor-upload"}>UPLOAD TO EXTENSION <b>✣</b></button>
              <button className="real-editor-secondary">↻ &nbsp; REGENERATE</button>
              <button className="real-editor-secondary">← &nbsp; BACK</button>
            </aside>
          </div>
          </div>
        </main>
      </div>
    </Interactive.Div>
  );
};

const DocsWorkspace = ({frame}: {readonly frame: number}) => {
  const typedCount = Math.floor(interpolate(frame, [375, 450], [0, finalText.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const complete = frame >= 450;
  return (
    <Interactive.Div
      name="Auto Typer camera"
      className="real-camera"
      style={{
        opacity: interpolate(frame, [360, 372, 470, 479], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: [Easing.bezier(0.4, 0, 0.2, 1), Easing.linear, Easing.bezier(0.4, 0, 0.2, 1)],
        }),
      }}
    >
      <div className="real-docs-page">
        <div className="real-docs-head"><div className="real-doc-icon">▤</div><div><strong>Physical activity draft</strong><span>Saved to Drive</span></div><button>Share</button><div className="real-doc-user">S</div></div>
        <div className="real-doc-menu"><span>File</span><span>Edit</span><span>View</span><span>Insert</span><span>Format</span><span>Tools</span><span>Help</span></div>
        <div className="real-doc-toolbar"><span>↶</span><span>↷</span><i /><b>100%</b><i /><b>Normal text</b><i /><b>Arial</b><i /><b>11</b></div>
        <div className="real-doc-canvas"><div className="real-doc-sheet"><strong>Why movement matters for students</strong><p>{finalText.slice(0, typedCount)}{!complete ? <i /> : null}</p></div></div>
        <div className={complete ? "real-autotyper complete" : "real-autotyper"}><Fingerprint /><div><strong>{complete ? "Typing complete" : "Auto Typing"}</strong><span>{complete ? "Saved in Google Docs" : "Natural pace · Student result"}</span></div><b>{complete ? "✓" : "Ⅱ"}</b></div>
      </div>
    </Interactive.Div>
  );
};

export const LevelMatchingGuide = () => {
  const frame = useCurrentFrame();
  const showLoading = frame >= 188 && frame < 250;
  const showEditor = frame >= 250 && frame < 372;
  const showDocs = frame >= 360;

  return (
    <AbsoluteFill className="real-app-film">
      <Interactive.Div
        name="Real Bipass workflow"
        className="real-app-stage"
        style={{
          opacity: interpolate(frame, [0, 12, 470, 479], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: [Easing.bezier(0.16, 1, 0.3, 1), Easing.linear, Easing.bezier(0.4, 0, 1, 1)],
          }),
        }}
      >
        {!showEditor && !showDocs ? <HomeWorkspace frame={frame} /> : null}
        {showLoading ? <LoadingScreen frame={frame} /> : null}
        {showEditor ? <EditorWorkspace frame={frame} /> : null}
        {showDocs ? <DocsWorkspace frame={frame} /> : null}
      </Interactive.Div>
      {!showLoading ? (
        <>
          <ActionCue frame={frame} range={[96, 106, 150, 160]} step="01" label="Choose Student" />
          <ActionCue frame={frame} range={[160, 168, 184, 192]} step="02" label="Match my level" />
          <ActionCue frame={frame} range={[252, 264, 310, 320]} step="03" label="Review the changes" />
          <ActionCue frame={frame} range={[320, 330, 354, 364]} step="04" label="Upload to extension" />
          <ActionCue frame={frame} range={[372, 382, 450, 462]} step="05" label="Auto Type in Google Docs" />
        </>
      ) : null}
      {!showLoading && !showDocs ? (
        <Pointer
          clickFrames={[140, 182, 352]}
          clickColor="#22c55e"
          clickFill="rgba(34, 197, 94, 0.18)"
          clickRadius={32}
          points={[
            {frame: 10, x: 660, y: 540},
            {frame: 96, x: 660, y: 540},
            {frame: 124, x: 1900, y: 580},
            {frame: 140, x: 1900, y: 580},
            {frame: 154, x: 1900, y: 580},
            {frame: 176, x: 820, y: 1310},
            {frame: 182, x: 820, y: 1310},
            {frame: 188, x: 820, y: 1310},
            {frame: 270, x: 865, y: 500},
            {frame: 315, x: 865, y: 500},
            {frame: 345, x: 2340, y: 1090},
            {frame: 352, x: 2340, y: 1090},
            {frame: 360, x: 2340, y: 1090},
          ]}
          visibleFrom={8}
          visibleUntil={360}
        />
      ) : null}
    </AbsoluteFill>
  );
};
