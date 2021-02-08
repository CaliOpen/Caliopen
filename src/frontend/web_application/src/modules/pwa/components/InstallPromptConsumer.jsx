import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { InstallPromptContext } from '../contexts/InstallPromptContext';

// eslint-disable-next-line react/prefer-stateless-function
class InstallPromptConsumer extends Component {
  static propTypes = {
    render: PropTypes.func.isRequired,
  };

  render() {
    const { render } = this.props;

    return (
      <InstallPromptContext.Consumer>
        {(value) => render(value)}
      </InstallPromptContext.Consumer>
    );
  }
}

export default InstallPromptConsumer;
