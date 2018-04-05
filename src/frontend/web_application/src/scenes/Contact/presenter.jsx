import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { v1 as uuidV1 } from 'uuid';
import { Trans } from 'lingui-react';
import { WithSettings } from '../../modules/settings';
import { ManageEntityTags } from '../../modules/tags';
import fetchLocation from '../../services/api-location';
import { formatName } from '../../services/contact';
import ContactProfileForm from './components/ContactProfileForm';
import ContactDetails from './components/ContactDetails';
import ContactProfile from './components/ContactProfile';
import { PageTitle, Modal, MenuBar, Button, TextBlock, Dropdown, withDropdownControl, Spinner, VerticalMenu, VerticalMenuItem, Confirm } from '../../components';
import FormCollection from './components/FormCollection';
import EmailForm from './components/EmailForm';
import PhoneForm from './components/PhoneForm';
import ImForm from './components/ImForm';
import AddressForm from './components/AddressForm';
// FIXME: birthday deactivated due to redux-form bug cf. AddFormFieldForm
// import BirthdayForm from './components/BirthdayForm';
import OrgaForm from './components/OrgaForm';
import IdentityForm from './components/IdentityForm';
import AddFormFieldForm from './components/AddFormFieldForm';


import './style.scss';

const DropdownControl = withDropdownControl(Button);

class Contact extends Component {
  static propTypes = {
    i18n: PropTypes.shape({}).isRequired,
    notifyError: PropTypes.func.isRequired,
    requestContact: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
    updateContact: PropTypes.func.isRequired,
    deleteContact: PropTypes.func.isRequired,
    invalidateContacts: PropTypes.func.isRequired,
    contactId: PropTypes.string,
    contact: PropTypes.shape({}),
    user: PropTypes.shape({}),
    form: PropTypes.string.isRequired,
    currentTab: PropTypes.shape({}),
    removeTab: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
    pristine: PropTypes.bool.isRequired,
    submitting: PropTypes.bool.isRequired,
    updateTagCollection: PropTypes.func.isRequired,
    // birthday: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  };

  static defaultProps = {
    contact: undefined,
    currentTab: undefined,
    contactId: undefined,
    // birthday: undefined,
    user: undefined,
  };

  constructor(props) {
    super(props);
    this.dropdownId = uuidV1();
  }

  state = {
    isTagModalOpen: false,
    editMode: false,
    isFetching: false,
    isSaving: false,
  };

  componentWillMount() {
    if (!this.props.contactId) {
      this.setState({
        editMode: true,
      });
    } else {
      this.setState({ isFetching: true });
    }
  }

  componentDidMount() {
    const { contactId, requestContact } = this.props;
    if (contactId) {
      requestContact(contactId).then(() => this.setState({ isFetching: false }));
    }
  }

  closeTab = () => {
    const { currentTab } = this.props;
    if (currentTab) {
      return this.props.removeTab(currentTab);
    }

    return this.props.push('/contacts');
  }

  handleOpenTags = () => {
    this.setState(prevState => ({
      ...prevState,
      isTagModalOpen: true,
    }));
  }

  handleCloseTags = () => {
    this.setState(prevState => ({
      ...prevState,
      isTagModalOpen: false,
    }));
  }

  toggleEditMode = () => {
    this.setState(prevState => ({
      ...prevState,
      editMode: !prevState.editMode,
    }), () => {
      if (!this.state.editMode) {
        this.props.reset();
      }
    });
  }

  handleCancel = () => {
    const { contactId } = this.props;
    if (!contactId) {
      this.closeTab();
    }

    return this.toggleEditMode();
  }

  handleDelete = () => {
    const {
      contactId, currentTab, push, removeTab, invalidateContacts,
    } = this.props;
    this.setState({ isFetching: true });
    this.props.deleteContact({ contactId })
      .then(() => invalidateContacts())
      .then(() => this.setState({ isFetching: false }))
      .then(() => push('/contacts'))
      .then(() => removeTab(currentTab));
  }

  createOrUpdateAction = async ({ contact, original }) => {
    const {
      updateContact, requestContact, settings, createContact, currentTab, updateTab,
      i18n, push, removeTab,
    } = this.props;
    if (contact.contact_id) {
      await updateContact({ contact, original });

      const contactUpToDate = await requestContact(contact.contact_id);
      const format = settings.contact_display_format;
      const tab = {
        ...currentTab,
        label: formatName({ contact, format }) || i18n._('contact.profile.name_not_set', { defaults: '(N/A)' }),
      };
      updateTab({ tab, original: currentTab });

      return contactUpToDate;
    }

    const resultAction = await createContact({ contact });
    const { location } = resultAction.payload.data;
    const { data: contactCreated } = await fetchLocation(location);

    push(`/contacts/${contactCreated.contact_id}`);
    removeTab(currentTab);

    return contactCreated;
  };

  handleSubmit = (ev) => {
    const {
      i18n, handleSubmit, contactId, notifyError, contact: original,
    } = this.props;
    this.setState({ isSaving: true });
    handleSubmit(ev)
      .then(contact => this.createOrUpdateAction({ contact, original }))
      .then(() => contactId && this.toggleEditMode(), () => {
        notifyError({ message: i18n._('contact.feedback.unable_to_save', { defaults: 'Unable to save the contact' }) });
      })
      .then(() => this.setState({ isSaving: false }));
  }

  handleTagsChange = async ({ tags }) => {
    const { updateTagCollection, i18n, contact: entity } = this.props;

    return updateTagCollection(i18n, { type: 'contact', entity, tags });
  }

  renderTagsModal = () => {
    const { contact, i18n } = this.props;
    const nb = contact.tags ? contact.tags.length : 0;
    const title = (
      <Trans
        id="tags.header.title"
        defaults={'Tags <0>(Total: {nb})</0>'}
        values={{ nb }}
        components={[
          (<span className="m-tags-form__count" />),
        ]}
      />
    );

    return (
      <Modal
        isOpen={this.state.isTagModalOpen}
        contentLabel={i18n._('tags.header.label', { defaults: 'Tags' })}
        title={title}
        onClose={this.handleCloseTags}
      >
        <ManageEntityTags type="contact" entity={contact} onChange={this.handleTagsChange} />
      </Modal>
    );
  }

  renderEditBar = () => {
    const { pristine, submitting } = this.props;
    const hasActivity = submitting || this.state.isSaving;

    return (
      <div className="s-contact__edit-bar">
        <Button
          onClick={this.handleCancel}
          responsive="icon-only"
          icon="remove"
          className="s-contact__action"
        >
          <Trans id="contact.action.cancel_edit">Cancel</Trans>
        </Button>
        <TextBlock className="s-contact__bar-title">
          <Trans id="contact.edit_contact.title">Edit contact</Trans>
        </TextBlock>
        <Button
          type="submit"
          responsive="icon-only"
          icon={hasActivity ? (<Spinner isLoading display="inline" />) : 'check'}
          className="s-contact__action"
          disabled={pristine || hasActivity}
        >
          <Trans id="contact.action.validate_edit">Validate</Trans>
        </Button>
      </div>
    );
  }

  renderActionBar = (contactDisplayFormat) => {
    const {
      submitting, contact, user, contactId,
    } = this.props;
    const contactDisplayName = formatName({ contact, format: contactDisplayFormat });
    const contactIsUser = contactId && user && user.contact.contact_id === contactId;
    const hasActivity = submitting || this.state.isFetching || this.state.isSaving;

    return (
      <div className="s-contact__action-bar">
        <TextBlock className="s-contact__bar-title">
          {contactDisplayName}
        </TextBlock>
        <DropdownControl
          toggleId={this.dropdownId}
          className="s-contact__actions-switcher"
          icon={hasActivity ? (<Spinner isLoading display="inline" />) : 'ellipsis-v'}
        />

        <Dropdown
          id={this.dropdownId}
          className="s-contact__actions-menu"
          closeOnClick="all"
          isMenu
        >
          <VerticalMenu>
            <VerticalMenuItem>
              <Button
                onClick={this.toggleEditMode}
                className="s-contact__action"
                display="expanded"
              >
                <Trans id="contact.action.edit_contact">Edit contact</Trans>
              </Button>
            </VerticalMenuItem>
            <VerticalMenuItem>
              <Button
                onClick={this.handleOpenTags}
                className="s-contact__action"
                display="expanded"
              >
                <Trans id="contact.action.edit_tags">Edit tags</Trans>
              </Button>
              { this.renderTagsModal() }
            </VerticalMenuItem>
            {/* TODO: this.handleShare() function
              <VerticalMenuItem>
                <Button
                  onClick={this.handleShare}
                  className="s-contact__action"
                  display="expanded"
                >
                  <Trans id="contact.action.share_contact">Share</Trans>
                </Button>
              </VerticalMenuItem>
            */}
            { !contactIsUser && // to prevents deleting user's contact
              <VerticalMenuItem>
                <Confirm
                  className="s-contact__action-delete"
                  onConfirm={this.handleDelete}
                  title={(<Trans id="contact.confirm-delete.title">Delete the contact</Trans>)}
                  content={(<Trans id="contact.confirm-delete.content">The deletion is permanent, are you sure you want to delete this contact ?</Trans>)}
                  render={confirm => (
                    <Button
                      onClick={confirm}
                      display="expanded"
                    >
                      <Trans id="contact.action.delete_contact">Delete</Trans>
                    </Button>
                  )}
                />
              </VerticalMenuItem>
            }
          </VerticalMenu>
        </Dropdown>
      </div>
    );
  }

  renderDetailForms() {
    const { form } = this.props;
    // const hasBirthday = this.props.birthday !== undefined;

    return (
      <div>
        <FormCollection component={(<EmailForm />)} propertyName="emails" showAdd={false} />
        <FormCollection component={(<PhoneForm />)} propertyName="phones" showAdd={false} />
        <FormCollection component={(<ImForm />)} propertyName="ims" showAdd={false} />
        <FormCollection component={(<AddressForm />)} propertyName="addresses" showAdd={false} />
        {/* {hasBirthday && (<BirthdayForm form={form} />)} */}
        <AddFormFieldForm form={form} />
      </div>
    );
  }

  render() {
    const {
      contact, contactId, form,
    } = this.props;

    return (
      <WithSettings
        synced
        render={({ contact_display_format: contactDisplayFormat }) => (
          <form onSubmit={this.handleSubmit} method="post">
            <PageTitle />
            {(contact || !contactId) && (
              <MenuBar className="s-contact__menu-bar">
                {
                  // FIXME: edit and action bars be displayed in fixed Header,
                  // not in MenuBar
                }
                {this.state.editMode ?
                  this.renderEditBar() :
                  this.renderActionBar(contactDisplayFormat)
                }
              </MenuBar>
            )}

            {(contact || !contactId) && (
              <div className="s-contact">
                <div className="s-contact__col-datas-irl">
                  <ContactProfile
                    contact={contact}
                    contactDisplayFormat={contactDisplayFormat}
                    editMode={this.state.editMode}
                    form={(<ContactProfileForm form={form} isNew={!contact} />)}
                  />
                </div>
                <div className="s-contact__col-datas-online">
                  <ContactDetails
                    contact={contact}
                    editMode={this.state.editMode}
                    detailForms={this.renderDetailForms()}
                    orgaForms={(<FormCollection component={(<OrgaForm />)} propertyName="organizations" />)}
                    identityForms={(<FormCollection component={(<IdentityForm />)} propertyName="identities" />)}
                  />
                </div>
              </div>
                )}
          </form>
        )}
      />
    );
  }
}

export default Contact;
