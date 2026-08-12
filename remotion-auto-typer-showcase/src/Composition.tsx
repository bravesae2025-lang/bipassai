import {Composition, Folder} from "remotion";
import {AutoTyperFilm} from "./AutoTyperFilm";
import {CompleteScene} from "./scenes/CompleteScene";
import {ConfigureScene} from "./scenes/ConfigureScene";
import {SelectTextScene} from "./scenes/SelectTextScene";
import {TypingScene} from "./scenes/TypingScene";

export const MyComposition = () => {
  return (
    <>
      <Composition
        component={AutoTyperFilm}
        durationInFrames={435}
        fps={30}
        height={900}
        id="AutoTyperShowcase"
        width={1600}
      />
      <Folder name="AutoTyperScenes">
        <Composition
          component={SelectTextScene}
          durationInFrames={105}
          fps={30}
          height={900}
          id="ChooseText"
          width={1600}
        />
        <Composition
          component={ConfigureScene}
          durationInFrames={120}
          fps={30}
          height={900}
          id="Configure"
          width={1600}
        />
        <Composition
          component={TypingScene}
          durationInFrames={180}
          fps={30}
          height={900}
          id="TypeInDocs"
          width={1600}
        />
        <Composition
          component={CompleteScene}
          durationInFrames={75}
          fps={30}
          height={900}
          id="Complete"
          width={1600}
        />
      </Folder>
    </>
  );
};
