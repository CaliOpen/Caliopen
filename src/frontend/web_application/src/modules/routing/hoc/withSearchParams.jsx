import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { URLSearchParams } from '../services/url';
import { getSearchParams } from '../services/getSearchParams';

/**
 * @deprecated, use useSearchParams
 */
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

      const searchParams = getSearchParams(location.search);

      return <C searchParams={searchParams} {...props} />;
    }
  }

  return WithSearchParams;
};
