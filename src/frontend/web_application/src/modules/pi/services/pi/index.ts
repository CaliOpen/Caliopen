import { PI, MessagePI } from '../../types';

export const PI_PROPERTIES = ['comportment', 'technic', 'context'];
export const PI_MESSAGE_PROPERTIES = ['content', 'transport', 'social'];
export const PI_LEVEL_DISABLED = 'disabled-pi';
export const PI_LEVEL_UGLY = 'ugly';
export const PI_LEVEL_BAD = 'bad';
export const PI_LEVEL_GOOD = 'good';
export const PI_LEVEL_SUPER = 'super';

export const getPiClass = (piAggregate: number | any) => {
  if (Number.isNaN(piAggregate)) return PI_LEVEL_DISABLED;

  if (piAggregate < 25) return PI_LEVEL_UGLY;
  if (piAggregate < 50) return PI_LEVEL_BAD;

  return piAggregate < 75 ? PI_LEVEL_GOOD : PI_LEVEL_SUPER;
};

export const getAngles = () => {
  const piLength = PI_PROPERTIES.length;
  if (piLength === 0) {
    return 0;
  }

  return 360 / piLength;
};

export const getAveragePI = (pi: PI | MessagePI | void, piProps: string[]) => {
  if (!pi) return NaN;

  return Math.round(
    piProps.reduce((acc, name) => acc + pi[name] || 0, 0) / piProps.length
  );
};

export const getAveragePIMessage = ({ message }) =>
  getAveragePI(message.pi_message, PI_MESSAGE_PROPERTIES);

export type ScoreLetter = 'A' | 'B' | 'C' | 'D' | 'E';

export const computeScoreLetter = (percent: number) => {
  let key = Math.ceil(percent / 20);
  if (key < 1) {
    key = 1;
  }
  if (key > 5) {
    key = 5;
  }

  // reverse: A eq 0; E eq 4;
  const baseCharCode = 5 - key;

  return String.fromCharCode(65 + baseCharCode) as ScoreLetter;
};

export const computePiScoreLetter = (pi: PI) =>
  computeScoreLetter(getAveragePI(pi, PI_PROPERTIES));
