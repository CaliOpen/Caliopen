import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { v1 as uuidV1 } from 'uuid';
import ManageTags from './ManageTags';
import ContactProfileForm from './components/ContactProfileForm';
import Spinner from '../../components/Spinner';
import ContactDetails from '../../components/ContactDetails';
import ContactProfile from '../../components/ContactProfile';
import Modal from '../../components/Modal';
import MenuBar from '../../components/MenuBar';
import Button from '../../components/Button';
import TextBlock from '../../components/TextBlock';
import DropdownMenu, { withDropdownControl } from '../../components/DropdownMenu';
import VerticalMenu, { VerticalMenuItem } from '../../components/VerticalMenu';
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

import { UPDATE_CONTACT_SUCCESS } from '../../store/modules/contact';
import './style.scss';

// const FAKE_TAGS = ['Caliopen', 'Gandi', 'Macarons'];
const DropdownControl = withDropdownControl(Button);

const noop = str => str;

class Contact extends Component {
  static propTypes = {
    __: PropTypes.func.isRequired,
    requestContact: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
    updateContact: PropTypes.func.isRequired,
    notifyError: PropTypes.func.isRequired,
    removeContact: PropTypes.func,
    contactId: PropTypes.string.isRequired,
    contact: PropTypes.shape({}),
    isFetching: PropTypes.bool,
    form: PropTypes.string.isRequired,
    // birthday: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  };

  static defaultProps = {
    isFetching: false,
    removeContact: noop,
    contact: undefined,
    birthday: undefined,
  };

  constructor(props) {
    super(props);
    this.dropdownId = uuidV1();
  }

  state = {
    isTagsModalOpen: false,
    editMode: false,
  };

  componentDidMount() {
    const { contactId, requestContact } = this.props;
    requestContact({ contactId });
  }

  handleContactChange = ({ contact, original }) => {
    const { __, updateContact, notifyError, requestContact } = this.props;

    updateContact({ contact, original })
      .then((action) => {
        if (action.type === UPDATE_CONTACT_SUCCESS) {
          return requestContact({ contactId: contact.contact_id });
        }

        return notifyError(__('contact.feedback.update-fail'));
      })
    ;
  }

  handleContactDelete = ({ contact }) => {
    this.props.removeContact({ contact });
  }

  openTagsModal = () => {
    this.setState(prevState => ({
      ...prevState,
      isTagsModalOpen: true,
    }));
  }

  closeTagsModal = () => {
    this.setState(prevState => ({
      ...prevState,
      isTagsModalOpen: false,
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

  handleSubmit = (ev) => {
    const { handleSubmit, contactId, requestContact } = this.props;

    handleSubmit(ev)
      .then(() => this.toggleEditMode())
      .then(() => requestContact({ contactId }));
  }

  renderTagsModal = () => {
    const { contact, updateContact, __ } = this.props;
    const count = contact.tags ? contact.tags.length : 0;
    const title = (
      <span>{__('tags.header.title')}
        <span className="m-tags-form__count">
          {__('tags.header.count', { count }) }
        </span>
      </span>);

    return (
      <Modal
        isOpen={this.state.isTagsModalOpen}
        contentLabel={__('tags.header.title')}
        title={title}
        onClose={this.closeTagsModal}
      >
        <ManageTags contact={contact} onContactChange={updateContact} />
      </Modal>
    );
  }

  renderEditBar = () => {
    const { __ } = this.props;

    return (
      <div className="s-contact__edit-bar">
        <Button
          onClick={this.toggleEditMode}
          responsive="icon-only"
          icon="remove"
          className="s-contact__action"
        >{__('contact.action.cancel_edit')}</Button>
        <TextBlock className="s-contact__bar-title">
          {__('contact.edit_contact.title')}
        </TextBlock>
        <Button
          type="submit"
          responsive="icon-only"
          icon="check"
          className="s-contact__action"
        >{__('contact.action.validate_edit')}</Button>
      </div>
    );
  }

  renderActionBar = () => {
    const { __, contact } = this.props;

    return (
      <div className="s-contact__action-bar">
        <TextBlock className="s-contact__bar-title">
          {contact.title}
        </TextBlock>
        <DropdownControl
          toggle={this.dropdownId}
          className="s-contact__actions-switcher float-right"
          icon="ellipsis-v"
        />

        <DropdownMenu
          id={this.dropdownId}
          className="s-contact__actions-menu"
          position="bottom"
          closeOnClick
        >
          <VerticalMenu>
            <VerticalMenuItem>
              <Button
                onClick={this.toggleEditMode}
                className="s-contact__action"
                display="expanded"
              >{__('contact.action.edit_contact')}</Button>
            </VerticalMenuItem>
            <VerticalMenuItem>
              <Button
                onClick={this.openTagsModal}
                className="s-contact__action"
                display="expanded"
              >{__('contact.action.edit_tags')}</Button>
              { this.renderTagsModal() }
            </VerticalMenuItem>
            <VerticalMenuItem>
              <Button
                onClick={this.openTagsModal}
                className="s-contact__action"
                display="expanded"
              >{__('contact.action.share_contact')}</Button>
            </VerticalMenuItem>
            <VerticalMenuItem>
              <Button
                onClick={this.handleContactDelete}
                className="s-contact__action"
                display="expanded"
              >{__('contact.action.delete_contact')}</Button>
            </VerticalMenuItem>
          </VerticalMenu>
        </DropdownMenu>
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
    const { __, isFetching, contact } = this.props;

    return (
      <form onSubmit={this.handleSubmit} method="post">
        {contact && (
          <MenuBar className="s-contact__menu-bar">
            {
              // FIXME: edit and action bars be displayed in fixed Header,
              // not in MenuBar
            }
            {this.state.editMode ? this.renderEditBar() : this.renderActionBar()}
          </MenuBar>
        )}

        <Spinner isLoading={isFetching} />

        {contact && (
          <div className="s-contact">
            <div className="s-contact__col-datas-irl">
              <ContactProfile
                contact={contact}
                editMode={this.state.editMode}
                form={(<ContactProfileForm />)}
              />
            </div>
            <div className="s-contact__col-datas-online">
              <ContactDetails
                contact={contact}
                editMode={this.state.editMode}
                detailForms={this.renderDetailForms()}
                orgaForms={(<FormCollection component={(<OrgaForm />)} propertyName="organizations" />)}
                identityForms={(<FormCollection component={(<IdentityForm />)} propertyName="identities" />)}
                __={__}
              />
            </div>
          </div>
          )}
      </form>
    );
  }
}

export default Contact;
