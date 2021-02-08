import { PI_PROPERTIES, getAngles } from '../pi';

export function calcXpoint(level, tilt, axeLength) {
  return Math.round(axeLength - level * Math.sin((tilt * Math.PI) / 180));
}

export function calcYpoint(level, tilt, axeLength) {
  return Math.round(axeLength - level * Math.cos((tilt * Math.PI) / 180));
}

export const calcGridCoordinates = ({ axeLength }) => {
  const angle = getAngles();
  const axeCoordinates = [];
  const outlinePoints = [];
  let tilt = 0;

  PI_PROPERTIES.forEach((axeName) => {
    const pointX = calcXpoint(axeLength, tilt, axeLength);
    const pointY = calcYpoint(axeLength, tilt, axeLength);
    outlinePoints.push(pointX, pointY);
    axeCoordinates.push({ axeName, x: pointX, y: pointY });
    tilt -= angle;
  });

  return { axeCoordinates, outlinePoints };
};

export const calcPolygonPoints = ({ pi, axeLength }) => {
  const angle = getAngles();
  const polygonPoints = [];
  let tilt = 0;
  PI_PROPERTIES.forEach((name) => {
    const piLevel = pi[name] || 0;

    polygonPoints.push(
      calcXpoint(piLevel, tilt, axeLength),
      calcYpoint(piLevel, tilt, axeLength)
    );
    tilt -= angle;
  });

  return polygonPoints;
};
