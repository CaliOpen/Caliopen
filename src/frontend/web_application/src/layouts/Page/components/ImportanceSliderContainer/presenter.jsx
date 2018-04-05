import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import debounce from 'lodash.debounce';
import { Range } from 'rc-slider';
import { IL_MIN, IL_MAX } from '../../../../services/importance-level';

import './style.scss';

const generateStateFromProps = ({ importanceLevelRange }) => ({
  importanceLevelRange,
});

class ImportanceSliderContainer extends Component {
  static propTypes = {
    className: PropTypes.string,
    importanceLevelRange: PropTypes.arrayOf(PropTypes.number).isRequired,
    setImportanceLevel: PropTypes.func.isRequired,
    vertical: PropTypes.bool,
  };
  static defaultProps = {
    className: undefined,
    vertical: false,
  };

  state = {
    importanceLevelRange: [IL_MIN, IL_MAX],
  };

  componentWillMount() {
    this.ticks = new Array(10).fill(0);
    this.setState(generateStateFromProps(this.props));
  }

  componentWillReceiveProps(nextProps) {
    this.setState(generateStateFromProps(nextProps));
  }

  setImportanceLevel = debounce((importanceLevelRange) => {
    this.props.setImportanceLevel(importanceLevelRange);
  }, 0.5 * 1000, { leading: false, trailing: true });

  handleChange = (importanceLevelRange) => {
    this.setState({ importanceLevelRange }, this.setImportanceLevel(importanceLevelRange));
  };

  renderTicks() {
    const { vertical } = this.props;

    return (
      <ul className={classnames('m-slider-container__slider-tick-list', { 'm-slider-container--vertical__slider-tick-list': vertical })}>
        {this.ticks.map((tick, index) => (
          <li
            className={classnames('m-slider-container__slider-tick', { 'm-slider-container--vertical__slider-tick': vertical })}
            key={index}
          />
        ))}
      </ul>
    );
  }

  render() {
    const { className, vertical } = this.props;

    return (
      <div className={classnames(className, 'm-slider-container', { 'm-slider-container--vertical': vertical })}>
        <Range
          min={IL_MIN}
          max={IL_MAX}
          onChange={this.handleChange}
          value={this.state.importanceLevelRange}
          vertical={vertical}
          // visibility is hardcoded in tracks, it breaks toggle dropdown
          trackStyle={[{ visibility: undefined }, { visibility: undefined }]}
        >
          {this.renderTicks()}
        </Range>
      </div>
    );
  }
}

export default ImportanceSliderContainer;
