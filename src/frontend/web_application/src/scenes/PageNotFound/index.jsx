import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withTranslator } from '@gandi/react-translate';
import ScrollToWhenHash from '../../components/ScrollToWhenHash';

@withTranslator()
class PageNotFound extends PureComponent {
  static propTypes = {
    __: PropTypes.func.isRequired,
  };
  static defaultProps = {
  };

  render() {
    const { __ } = this.props;

    return (
      <ScrollToWhenHash forceTop>{__('page not found')}</ScrollToWhenHash>
    );
  }
}

export default PageNotFound;
