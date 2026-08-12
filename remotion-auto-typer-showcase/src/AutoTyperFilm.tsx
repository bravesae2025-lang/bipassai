import {TransitionSeries, linearTiming} from "@remotion/transitions";
import {fade} from "@remotion/transitions/fade";
import {CompleteScene} from "./scenes/CompleteScene";
import {ConfigureScene} from "./scenes/ConfigureScene";
import {SelectTextScene} from "./scenes/SelectTextScene";
import {TypingScene} from "./scenes/TypingScene";

const transitionTiming = linearTiming({durationInFrames: 18});

export const AutoTyperFilm = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={150} name="Choose text" premountFor={60}>
      <SelectTextScene />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />
    <TransitionSeries.Sequence durationInFrames={200} name="Configure" premountFor={60}>
      <ConfigureScene />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />
    <TransitionSeries.Sequence durationInFrames={300} name="Type in Docs" premountFor={60}>
      <TypingScene />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />
    <TransitionSeries.Sequence durationInFrames={110} name="Complete" premountFor={60}>
      <CompleteScene />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);
