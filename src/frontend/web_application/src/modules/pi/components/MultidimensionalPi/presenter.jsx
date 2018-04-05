import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { v1 as uuidV1 } from 'uuid';
import PiGraph from '../PiGraph';
import Ratings from '../Ratings';
import { Button, Dropdown, withDropdownControl } from '../../../../components/';

import './style.scss';

const PI_MAX = 100; // max value for PI levels
const DropdownControl = withDropdownControl(Button);

const MultidimensionalPi = ({
  pi, displayAveragePi, className, mini,
}) => {
  const gridWidth = PI_MAX * 2;
  const id = uuidV1();

  return (
    <div className={classnames('m-multidimensional-pi', className)}>
      {mini ? (
        <div className="m-multidimensional-pi__mini-pi">
          <DropdownControl toggleId={id} className="m-multidimensional-pi__toggle-mini-pi">
            <Ratings
              pi={pi}
              piMax={PI_MAX}
              mini
            />
          </DropdownControl>

          <Dropdown
            id={id}
            className="m-multidimensional-pi__mini-graph"
            position="bottom"
            closeOnClick="all"
          >
            <Ratings
              pi={pi}
              piMax={PI_MAX}
              displayAveragePi={displayAveragePi}
            />
          </Dropdown>
        </div>
      ) : (
        <div>
          <PiGraph
            gridWidth={gridWidth}
            piMax={PI_MAX}
            pi={pi}
          />
          <Ratings
            pi={pi}
            piMax={PI_MAX}
            displayAveragePi={displayAveragePi}
          />
        </div>
      )
    }

    </div>
  );
};
MultidimensionalPi.defaultProps = {
  displayAveragePi: false,
  className: null,
  mini: false,
};
MultidimensionalPi.propTypes = {
  pi: PropTypes.shape({}).isRequired,
  mini: PropTypes.bool,
  className: PropTypes.string,
  displayAveragePi: PropTypes.bool,
};
export default MultidimensionalPi;
