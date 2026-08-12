import {AbsoluteFill} from "remotion";
import {PaperBackdrop} from "./components/PaperBackdrop";
import {ProductFlowScene} from "./scenes/ProductFlowScene";

export const AutoTyperFilm = () => (
  <AbsoluteFill className="film">
    <PaperBackdrop />
    <ProductFlowScene />
  </AbsoluteFill>
);
