export const PI_PROPERTIES = ['comportment', 'technic', 'context'];
export const getPiClass = (piAggregate) => {
  if (Number.isNaN(piAggregate)) return 'disabled-pi';

  if (piAggregate < 25) return 'ugly';
  if (piAggregate < 50) return 'bad';

  return piAggregate < 75 ? 'good' : 'super';
};

export const getAngles = () => {
  if (PI_PROPERTIES.length === 0) {
    return 0;
  }

  return 360 / PI_PROPERTIES.length;
};

export const getAveragePI = (pi) => {
  if (!pi) return NaN;

  const averagePI = (
    PI_PROPERTIES.reduce((acc, name) => acc + pi[name] || 0, 0)
  ) / PI_PROPERTIES.length;

  return Math.round(averagePI);
};
