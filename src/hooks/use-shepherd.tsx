/** PULLED FROM ARCHIVED REACT-SHEPHERD REPOSITORY */
import React, { FC, useMemo } from 'react';
import Shepherd from '@groupe/shepherd.js';
import {Tour, TourOptions, Step, StepOptionsButton, StepOptions} from '@groupe/shepherd.js';

type StepType = 'back' | 'cancel' | 'next';
export interface ShepherdButtonWithType extends StepOptionsButton {
  type?: StepType;
}

export interface ShepherdOptionsWithType extends StepOptions {
  buttons?: ReadonlyArray<StepOptionsButton | ShepherdButtonWithType>;
}

interface ShepherdProps {
  steps: Array<ShepherdOptionsWithType>;
  tourOptions: TourOptions;
  children: React.ReactNode;
}

const ShepherdTourContext = React.createContext<Tour | null>(null);
const ShepherdTourContextConsumer = ShepherdTourContext.Consumer;

/**
 * Take a set of steps and formats to use actions on the buttons in the current context
 * @param {Array} steps
 * @param {Array} tour
 * @private
 */
const addSteps = (steps: Array<StepOptions>, tour: Tour) => {
  // Return nothing if there are no steps
  if (!steps.length) {
    return [];
  }

  const parsedStepsforAction = steps.map((step: StepOptions): StepOptions => {
    const { buttons } = step;

    if (buttons) {
      step.buttons = buttons.map((button: ShepherdButtonWithType) => {
        const {
          action, classes, disabled, label, secondary, text, type,
        } = button;
        return {
          action: type ? tour[type] : action,
          classes,
          disabled,
          label,
          secondary,
          text,
          type,
        };
      });
    }

    return step;
  });

  return parsedStepsforAction.forEach((step: any) => tour.addStep(step));
};

// for instances where Context can't be used or doesn't make sense
export const useShepherdTour = ({ tourOptions, steps }: Pick<ShepherdProps, 'steps' | 'tourOptions'>) => {
  const tourObject = useMemo(() => {
    const tourInstance = new Shepherd.Tour(tourOptions) as Tour;

    addSteps(steps, tourInstance);

    return tourInstance;
  }, [tourOptions, steps]);

  return tourObject;
};

export const ShepherdTour: FC<ShepherdProps> = ({ children, tourOptions, steps }) => {
  const tourObject = useMemo(() => {
    const tourInstance = new Shepherd.Tour(tourOptions) as Tour;

    addSteps(steps, tourInstance);

    return tourInstance;
  }, [tourOptions, steps]);

  return (
    <ShepherdTourContext.Provider value={tourObject}>
      {children}
    </ShepherdTourContext.Provider>
  );
};