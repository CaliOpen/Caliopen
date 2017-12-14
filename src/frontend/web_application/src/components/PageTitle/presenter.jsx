import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DocumentTitle from 'react-document-title';

const DEFAULT_DOCUMENT_TITLE = 'Caliopen, be good!';

class PageTitle extends Component {

  static propTypes = {
    user: PropTypes.shape({}),
    currentTab: PropTypes.shape({}),
    title: PropTypes.string,
  };

  static defaultProps = {
    title: undefined,
    currentTab: undefined,
    user: undefined,
  };

  render() {
    const { user, title, currentTab } = this.props;
    const userName = user ? `${user.name}@alpha.caliopen.org - ` : '';
    const currentTabLabel = currentTab ? `${currentTab.label} - ` : '';
    const pageTitle = title ? `${title} - ` : currentTabLabel;
    const documentTitle = `${pageTitle}${userName}${DEFAULT_DOCUMENT_TITLE}`;

    return (
      <DocumentTitle title={documentTitle} />
    );
  }
}

export default PageTitle;
