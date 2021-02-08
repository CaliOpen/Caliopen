import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { URLSearchParams } from '../services/url';

export const withSearchParams = () => (C) => {
  @withRouter
  class WithSearchParams extends Component {
    static propTypes = {
      location: PropTypes.shape({
        search: PropTypes.string.isRequired,
      }).isRequired,
    };

    render() {
      const { location, ...props } = this.props;

      const paramsIterator = new URLSearchParams(location.search);

      const searchParams = Array.from(paramsIterator).reduce(
        (acc, keyVal) => ({
          ...acc,
          [keyVal[0]]: keyVal[1],
        }),
        {}
      );

      return <C searchParams={searchParams} {...props} />;
    }
  }

  return WithSearchParams;
};
