import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ContactList from './components/ContactList';
import ContactFilters from './components/ContactFilters';
import ImportContact from './components/ImportContact';
import Modal from '../../components/Modal';
import MenuBar from '../../components/MenuBar';
import TagList from './components/TagList';
import Spinner from '../../components/Spinner';
import Button from '../../components/Button';
import ScrollToWhenHash from '../../components/ScrollToWhenHash';

import './style.scss';

export const SORT_VIEW_GIVEN_NAME = 'given_name';
export const SORT_VIEW_FAMILY_NAME = 'family_name';
export const SORT_VIEW_TITLE = 'title';
export const DEFAULT_SORT_VIEW = SORT_VIEW_GIVEN_NAME;

const DEFAULT_SORT_DIR = 'ASC';

function getFilteredContacts(contactList, activeTag) {
  if (activeTag === '') {
    return contactList;
  }

  return contactList.filter(contact => contact.tags && contact.tags.includes(activeTag));
}


class ContactBook extends Component {
  static propTypes = {
    requestContacts: PropTypes.func.isRequired,
    loadMoreContacts: PropTypes.func.isRequired,
    contacts: PropTypes.arrayOf(PropTypes.shape({})),
    isFetching: PropTypes.bool,
    hasMore: PropTypes.bool,
    __: PropTypes.func.isRequired,
  };

  static defaultProps = {
    contacts: [],
    isFetching: false,
    hasMore: false,
  };

  state = {
    activeTag: '',
    sortDir: DEFAULT_SORT_DIR,
    isImportModalOpen: false,
  };

  componentDidMount() {
    this.props.requestContacts();
  }

  loadMore = () => {
    this.props.loadMoreContacts();
  }

  handleOpenImportModal = () => {
    this.setState({
      isImportModalOpen: true,
    });
  };

  handleCloseImportModal = () => {
    this.setState({
      isImportModalOpen: false,
    });
  };

  handleUploadSuccess = () => {
    this.props.requestContacts();
  };

  handleTagClick = (event) => {
    this.setState({
      activeTag: event.target.value,
    });
  };

  handleSortDirChange = (event) => {
    this.setState({
      sortDir: event.target.value,
    });
  };

  renderImportModal = () => {
    const { __ } = this.props;

    return (
      <Modal
        isOpen={this.state.isImportModalOpen}
        contentLabel={__('import-contact.action.import_contacts')}
        title={__('import-contact.action.import_contacts')}
        onClose={this.handleCloseImportModal}
      >
        <ImportContact
          onCancel={this.handleCloseImportModal}
          onUploadSuccess={this.handleUploadSuccess}
        />
      </Modal>
    );
  }

  render() {
    const { contacts, isFetching, hasMore, __ } = this.props;

    const tags = contacts
      .filter(contact => contact.tags)
      .reduce((acc, contact) => [
        ...acc,
        ...contact.tags,
      ], []);

    return (
      <ScrollToWhenHash forceTop className="l-contact-book">
        <MenuBar>
          <ContactFilters
            onSortDirChange={this.handleSortDirChange}
            sortDir={this.state.sortDir}
            __={__}
          />
        </MenuBar>

        <div className="l-contact-book__contacts">
          <div className="l-contact-book__tags">
            <TagList
              tags={tags}
              activeTag={this.state.activeTag}
              onTagClick={this.handleTagClick}
              nbContactsAll={contacts.length}
              __={__}
            />
            <div className="l-contact-book__import">
              <div className="l-contact-book__import-button">
                <Button
                  icon="plus"
                  className="l-contact-book__button"
                  shape="hollow"
                  display="expanded"
                  onClick={this.handleOpenImportModal}
                >{__('import-contact.action.import_contacts')}</Button>
              </div>
              {this.renderImportModal()}
            </div>
          </div>

          <div className="l-contact-book__contact-list">
            {isFetching && (
              <Spinner isLoading={isFetching} />
            )}
            <ContactList
              contacts={getFilteredContacts(contacts, this.state.activeTag)}
              sortDir={this.state.sortDir}
            />
            {hasMore && (
              <div className="l-contact-book-list__load-more">
                <Button shape="hollow" onClick={this.loadMore}>
                  {__('general.action.load_more')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </ScrollToWhenHash>
    );
  }
}

export default ContactBook;
