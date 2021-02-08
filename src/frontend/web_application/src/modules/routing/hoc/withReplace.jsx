import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

export const withReplace = () => (C) => {
  @withRouter
  class WithReplace extends Component {
    static propTypes = {
      history: PropTypes.shape({}).isRequired,
      match: PropTypes.shape({}).isRequired,
      location: PropTypes.shape({}).isRequired,
    };

    render() {
      const {
        history: { replace },
        match,
        location,
        ...props
      } = this.props;

      return <C replace={replace} {...props} />;
    }
  }

  return WithReplace;
};
