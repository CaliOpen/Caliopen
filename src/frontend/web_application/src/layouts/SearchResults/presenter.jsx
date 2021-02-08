import React, { PureComponent } from 'react';
import { Trans } from '@lingui/react';
import PropTypes from 'prop-types';
import { matchPath, withRouter } from 'react-router-dom';
import MenuBar from '../../components/MenuBar';

@withRouter
class SearchResults extends PureComponent {
  static propTypes = {
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      search: PropTypes.string.isRequired,
    }).isRequired,
    term: PropTypes.string,
    searchResultsPreview: PropTypes.shape({
      total: PropTypes.number,
      contact_hits: PropTypes.shape({
        total: PropTypes.number,
      }),
      messages_hits: PropTypes.shape({
        total: PropTypes.number,
      }),
    }),
    children: PropTypes.node,
  };

  static defaultProps = {
    term: '',
    searchResultsPreview: {
      contact_hits: {
        total: 0,
      },
      messages_hits: {
        total: 0,
      },
      total: 0,
    },
    children: null,
  };

  render() {
    const {
      children,
      location: { pathname, search },
      term,
      searchResultsPreview: {
        total,
        contact_hits: { total: nbContacts },
        messages_hits: { total: nbMessages },
      },
    } = this.props;

    const location = `${pathname}${search}`;

    const navLinks = [
      {
        key: 'search-results.all',
        label: (
          <Trans id="search-results.all" values={{ total }}>
            All ({total})
          </Trans>
        ),
        to: `/search-results?term=${term}`,
      },
      {
        key: 'search-results.messages',
        label: (
          <Trans id="search-results.messages" values={{ nbMessages }}>
            Messages ({nbMessages})
          </Trans>
        ),
        to: `/search-results?term=${term}&doctype=message`,
      },
      {
        key: 'search-results.contacts',
        label: (
          <Trans id="search-results.contacts" values={{ nbContacts }}>
            Contacts ({nbContacts})
          </Trans>
        ),
        to: `/search-results?term=${term}&doctype=contact`,
      },
    ].map((link) => ({
      ...link,
      isActive:
        matchPath(location, { path: link.to, exact: false, strict: false }) &&
        true,
    }));

    return (
      <div className="l-search-results">
        <MenuBar className="l-search-results__menu-bar" navLinks={navLinks} />
        <div className="l-search-results__panel">{children}</div>
      </div>
    );
  }
}

export default SearchResults;
