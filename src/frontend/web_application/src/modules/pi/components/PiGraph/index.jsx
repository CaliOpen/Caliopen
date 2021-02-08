import React from 'react';
import PropTypes from 'prop-types';
import { calcPolygonPoints, calcGridCoordinates } from '../../services/svg';
import './style.scss';

const Grid = ({ axeLength }) => {
  const { axeCoordinates, outlinePoints } = calcGridCoordinates({ axeLength });

  return (
    <g className="m-pi-graph__grid">
      <polygon
        className="m-pi-graph__outline"
        points={outlinePoints.join(' ')}
      />
      {axeCoordinates.map((p) => (
        <line
          key={p.axeName}
          className="m-pi-graph__line"
          id={p.axeName}
          x1={axeLength}
          y1={axeLength}
          x2={p.x}
          y2={p.y}
        />
      ))}
    </g>
  );
};

Grid.propTypes = {
  axeLength: PropTypes.number.isRequired,
};

const Polygon = ({ pi, axeLength }) => {
  const polygonPoints = calcPolygonPoints({ pi, axeLength });

  return (
    <polygon className="m-pi-graph__shape" points={polygonPoints.join(' ')} />
  );
};

Polygon.propTypes = {
  pi: PropTypes.shape({}).isRequired,
  axeLength: PropTypes.number.isRequired,
};

const PiGraph = ({ pi, gridWidth }) => {
  const viewBox = [0, 0, gridWidth, gridWidth * 0.85]; // 0.85 ratio to avoid margin under PiGraph
  const axeLength = gridWidth / 2;

  return (
    <svg
      id="pi"
      className="m-pi-graph"
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
    >
      <Polygon pi={pi} axeLength={axeLength} />
      <Grid axeLength={axeLength} />
    </svg>
  );
};

PiGraph.propTypes = {
  pi: PropTypes.shape({}).isRequired,
  gridWidth: PropTypes.number.isRequired,
};

export default PiGraph;
