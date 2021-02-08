import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

export const withPush = () => (C) => {
  @withRouter
  class WithPush extends Component {
    static propTypes = {
      history: PropTypes.shape({}).isRequired,
      match: PropTypes.shape({}).isRequired,
      location: PropTypes.shape({}).isRequired,
    };

    render() {
      const {
        history: { push },
        match,
        location,
        ...props
      } = this.props;

      return <C push={push} {...props} />;
    }
  }

  return WithPush;
};
