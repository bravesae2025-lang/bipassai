import {Composition, Folder} from "remotion";
import {AutoTyperFilm} from "./AutoTyperFilm";
import {ProductFlowScene} from "./scenes/ProductFlowScene";

export const MyComposition = () => (
  <>
    <Composition
      component={AutoTyperFilm}
      durationInFrames={1260}
      fps={60}
      height={1080}
      id="AutoTyperShowcase"
      width={1920}
    />
    <Folder name="AutoTyperScenes">
      <Composition
        component={ProductFlowScene}
        durationInFrames={1260}
        fps={60}
        height={1080}
        id="ProductFlow"
        width={1920}
      />
    </Folder>
  </>
);
