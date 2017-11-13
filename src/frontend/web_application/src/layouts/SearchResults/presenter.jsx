import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { matchPath } from 'react-router-dom';
import MenuBar from '../../components/MenuBar';

class SearchResults extends PureComponent {
  static propTypes = {
    pathname: PropTypes.string,
    search: PropTypes.string,
    term: PropTypes.string,
    searchResultsPreview: PropTypes.shape({}),
    children: PropTypes.node,
    __: PropTypes.func.isRequired,
  };
  static defaultProps = {
    pathname: undefined,
    search: undefined,
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
      __,
      children,
      pathname,
      search,
      term,
      searchResultsPreview: {
        total,
        contact_hits: { total: nbContacts },
        messages_hits: { total: nbMessages },
      },
    } = this.props;

    const location = `${pathname}${search}`;

    const navLinks = [
      { title: __('search-results.all', { count: total }), to: `/search-results?term=${term}` },
      { title: __('search-results.messages', { count: nbMessages }), to: `/search-results?term=${term}&doctype=message` },
      { title: __('search-results.contacts', { count: nbContacts }), to: `/search-results?term=${term}&doctype=contact` },
    ].map(link => ({
      ...link,
      isActive: matchPath(location, { path: link.to, exact: false, strict: false }) && true,
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
