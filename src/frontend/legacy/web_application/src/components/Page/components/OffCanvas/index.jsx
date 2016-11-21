import React, { Component } from 'react';
import Presenter from './presenter';

class OffCanvas extends Component {
  componentDidMount() {
    // eslint-disable-next-line no-new
    new Foundation.OffCanvas(jQuery('#left_off_canvas'), {});
  }

  render() {
    return (
      <Presenter {...this.props} />
    );
  }
}

export default OffCanvas;
