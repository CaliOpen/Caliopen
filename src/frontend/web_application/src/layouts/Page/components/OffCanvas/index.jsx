import React, { Component } from 'react';
import PropTypes from 'prop-types';

class OffCanvas extends Component {
  static propTypes = {
    leftChildren: PropTypes.node.isRequired,
    children: PropTypes.node.isRequired,
  };

  componentDidMount() {
    // eslint-disable-next-line no-new
    new Foundation.OffCanvas(jQuery('#left_off_canvas'), {});
  }

  render() {
    const { leftChildren, children } = this.props;

    return (
      <div className="off-canvas-wrapper">
        <div className="off-canvas-wrapper-inner" data-off-canvas-wrapper>
          <div
            className="off-canvas position-left"
            id="left_off_canvas"
            data-off-canvas
          >
            {leftChildren}
          </div>
          <div className="off-canvas-content" data-off-canvas-content>
            {children}
          </div>
        </div>
      </div>
    );
  }
}

export default OffCanvas;
