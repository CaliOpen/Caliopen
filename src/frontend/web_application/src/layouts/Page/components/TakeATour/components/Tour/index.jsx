import React from 'react';
import TourBase from 'reactour';
import ReactDOM from 'react-dom';
import TourPortal from '../TourPortal';

const renderSubtreeIntoContainer = ReactDOM.unstable_renderSubtreeIntoContainer;

class Tour extends TourBase {
  renderPortal(props) {
    if (props.isOpen) {
      document.body.classList.add('reactour__body');
    } else {
      document.body.classList.remove('reactour__body');
    }

    this.portal = renderSubtreeIntoContainer(
      this,
      <TourPortal {...props} />,
      this.node
    );
  }
}

export default Tour;
