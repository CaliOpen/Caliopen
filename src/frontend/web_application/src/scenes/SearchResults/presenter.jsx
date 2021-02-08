import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import { Trans } from '@lingui/react';
import { WithSettings } from '../../modules/settings';
import SearchResultsLayout from '../../layouts/SearchResults';
import {
  Link,
  InfiniteScroll,
  PageTitle,
  Button,
  BlockList,
} from '../../components';
import MessageResultItem from './components/MessageResultItem';
import ContactResultItem from './components/ContactResultItem';

import './style.scss';

const LOAD_MORE_INTERVAL = 1000;

class SearchResults extends Component {
  static propTypes = {
    search: PropTypes.func.isRequired,
    loadMore: PropTypes.func.isRequired,
    term: PropTypes.string,
    doctype: PropTypes.string,
    hasMoreByDoctype: PropTypes.shape({}),
    searchResults: PropTypes.shape({}),
    searchResultsPreview: PropTypes.shape({}),
  };

  static defaultProps = {
    term: undefined,
    doctype: undefined,
    hasMoreByDoctype: undefined,
    searchResults: undefined,
    searchResultsPreview: undefined,
  };

  state = {};

  componentDidMount() {
    const { term, doctype, search } = this.props;

    if (term) {
      search({ term });
      if (doctype) {
        this.initLoadMore({ doctype, term });
        search({ term, doctype });
      }
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { term, doctype, search } = this.props;
    if (
      nextProps.term &&
      (nextProps.term !== term || nextProps.doctype !== doctype)
    ) {
      this.initLoadMore({ doctype: nextProps.doctype, term: nextProps.term });
      search({ term: nextProps.term, doctype: nextProps.doctype });
    }
  }

  initLoadMore = ({ doctype, term }) => {
    this.debouncedLoadMore = debounce(
      () =>
        this.props.hasMoreByDoctype &&
        this.props.hasMoreByDoctype[doctype] &&
        this.props.loadMore({ term, doctype }),
      LOAD_MORE_INTERVAL,
      {
        leading: true,
        trailing: false,
      }
    );
  };

  renderMessages(messages) {
    const { term } = this.props;

    return (
      <WithSettings
        render={({ default_locale: locale }) => (
          <BlockList className="s-search-results__item">
            {messages.map((messageHit) => (
              <MessageResultItem
                locale={locale}
                key={messageHit.document.message_id}
                message={messageHit.document}
                highlights={messageHit.highlights}
                term={term}
              />
            ))}
          </BlockList>
        )}
      />
    );
  }

  renderContacts(contacts) {
    const { term } = this.props;

    return (
      <BlockList className="s-search-results__item">
        {contacts.map((contactHit) => (
          <ContactResultItem
            key={contactHit.document.contact_id}
            contact={contactHit.document}
            highlights={contactHit.highlights}
            term={term}
          />
        ))}
      </BlockList>
    );
  }

  renderPreview() {
    if (!this.props.searchResultsPreview) {
      return null;
    }

    const {
      term,
      searchResultsPreview: {
        messages_hits: { total: nbMessages, messages },
        contact_hits: { total: nbContacts, contacts },
      },
    } = this.props;

    return (
      <div className="s-search-results__preview">
        {messages && (
          <div className="s-search-results__label">
            <Trans
              id="search-results.preview.nb-messages"
              values={{ nbMessages, term }}
            >
              {nbMessages} messages contains &quot;{term}&quot; in their subject
              or content:
            </Trans>{' '}
            <Link
              className="s-search-results__link"
              to={`/search-results?term=${term}&doctype=message`}
            >
              <Trans id="search-results.actions.display-all">Display all</Trans>
            </Link>
          </div>
        )}
        <div className="s-search-results__list">
          {messages && this.renderMessages(messages)}
        </div>
        {contacts && (
          <div className="s-search-results__label">
            <Trans
              id="search-results.preview.nb-contacts"
              values={{ nbContacts, term }}
            >
              {nbContacts} contacts contains &quot;{term}&quot; in their label
              or profile:
            </Trans>{' '}
            <Link
              className="s-search-results__link"
              to={`/search-results?term=${term}&doctype=contact`}
            >
              <Trans id="search-results.actions.display-all">Display all</Trans>
            </Link>
          </div>
        )}
        <div className="s-search-results__list">
          {contacts && this.renderContacts(contacts)}
        </div>
      </div>
    );
  }

  renderResults() {
    if (!this.props.searchResults) {
      return null;
    }

    const {
      doctype,
      hasMoreByDoctype,
      searchResults: {
        messages_hits: { messages },
        contact_hits: { contacts },
      },
    } = this.props;

    switch (doctype) {
      case 'message':
        return (
          <div>
            <InfiniteScroll onReachBottom={this.debouncedLoadMore}>
              {this.renderMessages(messages)}
            </InfiniteScroll>
            {hasMoreByDoctype && hasMoreByDoctype.message && (
              <div className="s-search-results__load-more">
                <Button shape="hollow" onClick={this.debouncedLoadMore}>
                  <Trans id="general.action.load_more">Load more</Trans>
                </Button>
              </div>
            )}
          </div>
        );
      case 'contact':
        return (
          <div>
            <InfiniteScroll onReachBottom={this.debouncedLoadMore}>
              {this.renderContacts(contacts)}
            </InfiniteScroll>
            {hasMoreByDoctype && hasMoreByDoctype.contact && (
              <div className="s-search-results__load-more">
                <Button shape="hollow" onClick={this.debouncedLoadMore}>
                  <Trans id="general.action.load_more">Load more</Trans>
                </Button>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  }

  render() {
    const { term, doctype, searchResultsPreview } = this.props;

    return (
      <div className="s-search-results">
        <PageTitle />
        <SearchResultsLayout
          term={term}
          searchResultsPreview={searchResultsPreview}
        >
          {doctype ? this.renderResults() : this.renderPreview()}
        </SearchResultsLayout>
      </div>
    );
  }
}

export default SearchResults;
