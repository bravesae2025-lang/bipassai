import {Composition, Folder} from "remotion";
import {AutoTyperFilm} from "./AutoTyperFilm";
import {ProductFlowScene} from "./scenes/ProductFlowScene";
import {LevelMatchingGuide} from "./LevelMatchingGuide";

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
    <Composition
      component={LevelMatchingGuide}
      durationInFrames={1152}
      fps={60}
      height={1440}
      id="LevelMatchingGuide"
      width={2560}
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
