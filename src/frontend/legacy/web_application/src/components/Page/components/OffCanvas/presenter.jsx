import React, { PropTypes } from 'react';

const Presenter = ({ leftChildren, children }) => (
  <div className="off-canvas-wrapper">
    <div className="off-canvas-wrapper-inner" data-off-canvas-wrapper>
      <div
        className="off-canvas position-left"
        id="left_off_canvas"
        data-off-canvas
      >{leftChildren}</div>
      <div className="off-canvas-content" data-off-canvas-content>
        {children}
      </div>
    </div>
  </div>
);

Presenter.propTypes = {
  leftChildren: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
};

export default Presenter;
