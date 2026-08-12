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
        durationInFrames={706}
        fps={60}
        height={1080}
        id="AutoTyperShowcase"
        width={1920}
      />
      <Folder name="AutoTyperScenes">
        <Composition
          component={SelectTextScene}
          durationInFrames={150}
          fps={60}
          height={1080}
          id="ChooseText"
          width={1920}
        />
        <Composition
          component={ConfigureScene}
          durationInFrames={200}
          fps={60}
          height={1080}
          id="Configure"
          width={1920}
        />
        <Composition
          component={TypingScene}
          durationInFrames={300}
          fps={60}
          height={1080}
          id="TypeInDocs"
          width={1920}
        />
        <Composition
          component={CompleteScene}
          durationInFrames={110}
          fps={60}
          height={1080}
          id="Complete"
          width={1920}
        />
      </Folder>
    </>
  );
};
