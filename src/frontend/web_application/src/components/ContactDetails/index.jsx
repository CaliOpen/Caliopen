import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Subtitle from '../Subtitle';
import TextList, { ItemContent } from '../TextList';
import AddressDetails from './components/AddressDetails';
import BirthdayDetails from './components/BirthdayDetails';
import EmailDetails from './components/EmailDetails';
import IdentityDetails from './components/IdentityDetails';
import ImDetails from './components/ImDetails';
import OrgaDetails from './components/OrgaDetails';
import PhoneDetails from './components/PhoneDetails';
import './style.scss';

class ContactDetails extends Component {
  static propTypes = {
    contact: PropTypes.shape({}).isRequired,
    editMode: PropTypes.bool.isRequired,
    detailForms: PropTypes.node.isRequired,
    orgaForms: PropTypes.node.isRequired,
    identityForms: PropTypes.node.isRequired,
    __: PropTypes.func.isRequired,
  };

  componentWillMount() {
    this.initDetailsTranslations();
  }

  initDetailsTranslations() {
    const { __ } = this.props;
    this.detailsTranslations = {
      address_type: {
        work: __('contact.address_type.work'),
        home: __('contact.address_type.home'),
        other: __('contact.address_type.other'),
      },
      im_type: {
        work: __('contact.im_type.work'),
        home: __('contact.im_type.home'),
        other: __('contact.im_type.other'),
        netmeeting: __('contact.im_type.netmeeting'),
      },
    };
  }

  renderEmail = (email) => {
    const { __ } = this.props;

    return (
      <ItemContent large>
        <EmailDetails email={email} __={__} />
      </ItemContent>
    );
  }

  renderPhone = (phone) => {
    const { __ } = this.props;

    return (
      <ItemContent large>
        <PhoneDetails phone={phone} __={__} />
      </ItemContent>
    );
  }

  renderIm = (im) => {
    const { __ } = this.props;

    return (
      <ItemContent large>
        <ImDetails im={im} __={__} />
      </ItemContent>
    );
  }

  renderAddress = (address) => {
    const { __ } = this.props;

    return (
      <ItemContent large>
        <AddressDetails address={address} __={__} />
      </ItemContent>
    );
  }

  renderIdentity = (identity) => {
    const { __ } = this.props;

    return (
      <ItemContent large>
        <IdentityDetails identity={identity} __={__} />
      </ItemContent>
    );
  }

  renderOrganization = (organization) => {
    const { __ } = this.props;

    return (
      <ItemContent large>
        <OrgaDetails organization={organization} __={__} />
      </ItemContent>
    );
  }

  renderBirthday = (birthday) => {
    const { __ } = this.props;

    return (
      <ItemContent large>
        <BirthdayDetails
          birthday={birthday}
          __={__}
        />
      </ItemContent>
    );
  }

  renderContactDetails = () => {
    const { contact } = this.props;
    const infos = contact.infos ? contact.infos : {};
    const emails = contact.emails ?
      [...contact.emails].sort((a, b) => a.address.localeCompare(b.address)) : [];
    const contactDetails = [
      ...emails.map(detail => this.renderEmail(detail)),
      ...(contact.phones ? contact.phones.map(detail => this.renderPhone(detail)) : []),
      ...(contact.ims ? contact.ims.map(detail => this.renderIm(detail)) : []),
      ...(contact.addresses ? contact.addresses.map(detail => this.renderAddress(detail)) : []),
      ...(infos ? [this.renderBirthday(infos.birthday ? infos.birthday : '')] : []),
    ];

    return (
      <TextList>
        {contactDetails.map((C, key) => <C.type {...C.props} key={key} />)}
      </TextList>
    );
  }

  renderOrganizationsDetails = () => {
    const { contact } = this.props;

    const contactDetails = [
      ...(contact.organizations ?
        contact.organizations.map(detail => this.renderOrganization(detail)) : []),
    ];

    return (
      <TextList>
        {contactDetails.map((C, key) => <C.type {...C.props} key={key} />)}
      </TextList>
    );
  }

  renderIdentitiesDetails = () => {
    const { contact } = this.props;

    const contactDetails = [
      ...(contact.identities ?
        contact.identities.map(detail => this.renderIdentity(detail)) : []),
    ];

    return (
      <TextList>
        {contactDetails.map((C, key) => <C.type {...C.props} key={key} />)}
      </TextList>
    );
  }

  render() {
    const { __, editMode } = this.props;

    return (
      <div className="m-contact-details">
        <div className="m-contact-details__panel">
          <Subtitle hr>
            {__('contact.contact_details')}
          </Subtitle>
          <div className="m-contact-details__list">
            {editMode ?
              this.props.detailForms :
              this.renderContactDetails()
            }
          </div>
        </div>

        <div className="m-contact-details__panel">
          <Subtitle hr>{__('contact.contact_organizations')}</Subtitle>
          <div className="m-contact-details__list">
            {editMode ?
              this.props.orgaForms :
              this.renderOrganizationsDetails()
            }
          </div>
        </div>

        <div className="m-contact-details__panel">
          <Subtitle hr>{__('contact.contact_identities')}</Subtitle>
          <div className="m-contact-details__list">
            {editMode ?
              this.props.identityForms :
              this.renderIdentitiesDetails()
            }
          </div>
        </div>
      </div>
    );
  }
}

export default ContactDetails;
