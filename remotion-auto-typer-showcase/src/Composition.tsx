import {Composition, Folder} from "remotion";
import {AutoTyperFilm} from "./AutoTyperFilm";
import {CompleteScene} from "./scenes/CompleteScene";
import {ConfigureScene} from "./scenes/ConfigureScene";
import {OpeningScene} from "./scenes/OpeningScene";
import {SelectTextScene} from "./scenes/SelectTextScene";
import {TypingScene} from "./scenes/TypingScene";

export const MyComposition = () => {
  return (
    <>
      <Composition
        component={AutoTyperFilm}
        durationInFrames={1800}
        fps={60}
        height={1080}
        id="AutoTyperShowcase"
        width={1920}
      />
      <Folder name="AutoTyperScenes">
        <Composition
          component={OpeningScene}
          durationInFrames={180}
          fps={60}
          height={1080}
          id="Opening"
          width={1920}
        />
        <Composition
          component={SelectTextScene}
          durationInFrames={330}
          fps={60}
          height={1080}
          id="ChooseText"
          width={1920}
        />
        <Composition
          component={ConfigureScene}
          durationInFrames={300}
          fps={60}
          height={1080}
          id="Configure"
          width={1920}
        />
        <Composition
          component={TypingScene}
          durationInFrames={840}
          fps={60}
          height={1080}
          id="TypeInDocs"
          width={1920}
        />
        <Composition
          component={CompleteScene}
          durationInFrames={150}
          fps={60}
          height={1080}
          id="Complete"
          width={1920}
        />
      </Folder>
    </>
  );
};
