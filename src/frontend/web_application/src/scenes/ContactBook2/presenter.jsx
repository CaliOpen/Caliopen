import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'lingui-react';
import ContactList from './components/ContactList';
import ImportContact from '../ContactBook/components/ImportContact';
import TagList from '../ContactBook/components/TagList';
import { PageTitle, Spinner, Button, MenuBar, Modal, Checkbox } from '../../components';
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
    i18n: PropTypes.shape({}).isRequired,
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

  handleTagClick = (tagName) => {
    this.setState({
      activeTag: tagName,
    });
  };

  handleSortDirChange = (event) => {
    this.setState({
      sortDir: event.target.value,
    });
  };

  renderImportModal = () => {
    const { i18n } = this.props;

    return (
      <Modal
        isOpen={this.state.isImportModalOpen}
        contentLabel={i18n._('import-contact.action.import_contacts', { defaults: 'Import contacts' })}
        title={i18n._('import-contact.action.import_contacts', { defaults: 'Import contacts' })}
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
    const {
      contacts, isFetching, hasMore, i18n,
    } = this.props;

    return (
      <div className="contact-book">
        <PageTitle title={i18n._('header.menu.contacts', { defaults: 'Contacts' })} />
        <MenuBar>
          <div className="contact-book__col-selector">
            220 contacts sélectionnés : <Button display="inline" icon="trash">Supprimer</Button> <Button display="inline" icon="share">Commencer une discussion</Button> <Checkbox className="contact-book__select-all" />
          </div>
        </MenuBar>

        <div className="contact-book__contacts">
          <div className="contact-book__tags">
            <h2 className="contact-book__tags-title">Groupes</h2>
            <TagList
              activeTag={this.state.activeTag}
              onTagClick={this.handleTagClick}
            />
            <div className="contact-book__import">
              <div className="contact-book__import-button">
                <Button
                  icon="users"
                  className="contact-book__button"
                  shape="plain"
                  display="inline-block"
                  onClick={this.handleOpenImportModal}
                >
                  Nouveau groupe
                </Button>
              </div>
            </div>
          </div>

          <div className="contact-book__contact-list">
            {isFetching && (
              <Spinner isLoading={isFetching} />
            )}
            <ContactList
              contacts={getFilteredContacts(contacts, this.state.activeTag)}
              sortDir={this.state.sortDir}
            />
            {hasMore && (
              <div className="contact-book-list__load-more">
                <Button shape="hollow" onClick={this.loadMore}>
                  <Trans id="general.action.load_more">Load more</Trans>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default ContactBook;
