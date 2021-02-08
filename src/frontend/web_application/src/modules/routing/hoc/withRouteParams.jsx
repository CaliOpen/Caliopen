import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

export const withRouteParams = () => (C) => {
  @withRouter
  class WithRouteParams extends Component {
    static propTypes = {
      history: PropTypes.shape({}).isRequired,
      match: PropTypes.shape({ params: PropTypes.shape({}) }).isRequired,
      location: PropTypes.shape({}).isRequired,
    };

    render() {
      const {
        history,
        match: { params },
        location,
        ...props
      } = this.props;

      return <C routeParams={params} {...props} />;
    }
  }

  return WithRouteParams;
};
