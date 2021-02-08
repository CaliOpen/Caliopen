import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import DocumentTitle from 'react-document-title';

const DEFAULT_DOCUMENT_TITLE = 'Caliopen, be good!';

class PageTitle extends PureComponent {
  static propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
    }),
    // FIXME always undefined
    currentTab: PropTypes.shape({
      routeConfig: PropTypes.shape({
        tab: PropTypes.shape({
          renderLabel: PropTypes.func,
        }),
      }),
    }),
    title: PropTypes.string,
    hostname: PropTypes.string,
  };

  static defaultProps = {
    title: '',
    hostname: 'unknown',
    currentTab: undefined,
    user: undefined,
  };

  render() {
    const { user, title, currentTab, hostname } = this.props;
    const userName = user ? `${user.name}@${hostname} - ` : '';
    const currentTabLabel = currentTab
      ? `${currentTab.routeConfig.tab.renderLabel()} - `
      : '';
    const pageTitle = title ? `${title} - ` : currentTabLabel;
    const documentTitle = `${pageTitle}${userName}${DEFAULT_DOCUMENT_TITLE}`;

    return <DocumentTitle title={documentTitle} />;
  }
}

export default PageTitle;
