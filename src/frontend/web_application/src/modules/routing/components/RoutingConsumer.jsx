import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { RoutingContext } from '../contexts/RoutingContext';

// eslint-disable-next-line react/prefer-stateless-function
class RoutingConsumer extends Component {
  static propTypes = {
    render: PropTypes.func.isRequired,
  };

  render() {
    const { render } = this.props;

    return (
      <RoutingContext.Consumer>
        {(value) => render(value)}
      </RoutingContext.Consumer>
    );
  }
}

export default RoutingConsumer;
