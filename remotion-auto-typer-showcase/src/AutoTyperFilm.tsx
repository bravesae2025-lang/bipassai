import {AbsoluteFill, Sequence} from "remotion";
import {PaperBackdrop} from "./components/PaperBackdrop";
import {CompleteScene} from "./scenes/CompleteScene";
import {ConfigureScene} from "./scenes/ConfigureScene";
import {OpeningScene} from "./scenes/OpeningScene";
import {SelectTextScene} from "./scenes/SelectTextScene";
import {TypingScene} from "./scenes/TypingScene";

export const AutoTyperFilm = () => (
  <AbsoluteFill className="film">
    <PaperBackdrop />
    <Sequence durationInFrames={180} name="Opening" premountFor={60}>
      <OpeningScene />
    </Sequence>
    <Sequence durationInFrames={330} from={180} name="Choose text" premountFor={60}>
      <SelectTextScene />
    </Sequence>
    <Sequence durationInFrames={300} from={510} name="Set pace" premountFor={60}>
      <ConfigureScene />
    </Sequence>
    <Sequence durationInFrames={840} from={810} name="Type in document" premountFor={60}>
      <TypingScene />
    </Sequence>
    <Sequence durationInFrames={150} from={1650} name="Finish" premountFor={60}>
      <CompleteScene />
    </Sequence>
  </AbsoluteFill>
);
