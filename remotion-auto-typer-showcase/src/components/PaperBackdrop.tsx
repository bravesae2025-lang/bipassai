import {interpolate, useCurrentFrame} from "remotion";

export const PaperBackdrop = () => {
  const frame = useCurrentFrame();

  return (
    <div className="film-backdrop">
      <svg
        aria-hidden="true"
        className="film-lines"
        viewBox="0 0 2160 1280"
        style={{
          translate: interpolate(frame, [0, 1800], ["0px 0px", "-28px 14px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <g fill="none" stroke="#e1e1db" strokeWidth="1.4">
          <path d="M-80 285C260 104 420 482 778 254s563-53 791 93 423 97 692-48" />
          <path d="M-90 342C247 161 438 517 792 302s544-53 775 82 425 100 704-24" />
          <path d="M-100 900c354-190 565 173 882-47s534-85 781 59 442 105 695-40" />
          <path d="M-85 958c365-175 557 169 879-35s525-82 774 51 434 105 682-23" />
        </g>
      </svg>
    </div>
  );
};
