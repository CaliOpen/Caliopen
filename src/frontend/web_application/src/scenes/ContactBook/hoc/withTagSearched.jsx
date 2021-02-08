import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withSearchParams } from '../../../modules/routing';

export const withTagSearched = () => (C) => {
  @withSearchParams()
  class WithTagSearched extends Component {
    static propTypes = {
      searchParams: PropTypes.shape({}).isRequired,
    };

    render() {
      const {
        searchParams: { tag = '' },
        ...props
      } = this.props;

      return <C tagSearched={tag} {...props} />;
    }
  }

  return WithTagSearched;
};
