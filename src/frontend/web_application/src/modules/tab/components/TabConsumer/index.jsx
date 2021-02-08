import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TabContext } from '../../contexts/TabContext';

// eslint-disable-next-line react/prefer-stateless-function
class TabConsumer extends Component {
  static propTypes = {
    render: PropTypes.func.isRequired,
  };

  render() {
    const { render } = this.props;

    return (
      <TabContext.Consumer>{(value) => render(value)}</TabContext.Consumer>
    );
  }
}

export default TabConsumer;
