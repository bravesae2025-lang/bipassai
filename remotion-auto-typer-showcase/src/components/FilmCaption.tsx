import {useCurrentFrame} from "remotion";
import {eased} from "../lib/motion";

type FilmCaptionProps = {
  readonly compact?: boolean;
  readonly step?: string;
  readonly kicker: string;
  readonly title: string;
  readonly copy: string;
  readonly style?: React.CSSProperties;
};

export const FilmCaption = ({compact = false, step = "01", kicker, title, copy, style}: FilmCaptionProps) => {
  const frame = useCurrentFrame();
  const opacity = eased(frame, [0, 20], [0, 1]);
  const y = eased(frame, [0, 28], [28, 0]);

  return (
    <div className={`film-caption${compact ? " film-caption-compact" : ""}`} style={{...style, opacity, translate: `0 ${y}px`}}>
      <div className="film-caption-kicker"><span>{step}</span>{kicker}</div>
      <h1 className="film-caption-title">{title}</h1>
      <p className="film-caption-copy">{copy}</p>
    </div>
  );
};

export const DemoPill = () => <span className="film-demo-pill"><i /> Demo sped up</span>;
