import {useCurrentFrame} from "remotion";
import {eased} from "../lib/motion";

type FilmCaptionProps = {
  readonly kicker: string;
  readonly title: string;
  readonly copy: string;
  readonly style?: React.CSSProperties;
};

export const FilmCaption = ({kicker, title, copy, style}: FilmCaptionProps) => {
  const frame = useCurrentFrame();
  const opacity = eased(frame, [0, 14], [0, 1]);
  const y = eased(frame, [0, 18], [22, 0]);

  return (
    <div className="film-caption" style={{...style, opacity, translate: `0 ${y}px`}}>
      <div className="film-caption-kicker">{kicker}</div>
      <h1 className="film-caption-title">{title}</h1>
      <p className="film-caption-copy">{copy}</p>
    </div>
  );
};

export const DemoPill = () => <span className="film-demo-pill">Demo sped up</span>;
