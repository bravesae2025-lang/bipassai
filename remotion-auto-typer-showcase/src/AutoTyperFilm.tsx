import {TransitionSeries, linearTiming} from "@remotion/transitions";
import {fade} from "@remotion/transitions/fade";
import {CompleteScene} from "./scenes/CompleteScene";
import {ConfigureScene} from "./scenes/ConfigureScene";
import {SelectTextScene} from "./scenes/SelectTextScene";
import {TypingScene} from "./scenes/TypingScene";

const transitionTiming = linearTiming({durationInFrames: 15});

export const AutoTyperFilm = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={105} name="Choose text" premountFor={30}>
      <SelectTextScene />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />
    <TransitionSeries.Sequence durationInFrames={120} name="Configure" premountFor={30}>
      <ConfigureScene />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />
    <TransitionSeries.Sequence durationInFrames={180} name="Type in Docs" premountFor={30}>
      <TypingScene />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />
    <TransitionSeries.Sequence durationInFrames={75} name="Complete" premountFor={30}>
      <CompleteScene />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);
