import { Trans } from '@lingui/react';
import { AxiosResponse } from 'axios';
import * as React from 'react';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import {
  Icon,
  PlaceholderBlock,
  TextBlock,
  TextItem,
  TextList,
  Title,
} from 'src/components';
import { ContactAvatarLetter } from 'src/modules/avatar';
import { getContact, getQueryKeys } from 'src/modules/contact/query';
import { Contact as IContact } from 'src/modules/contact/types';
import { getAveragePI, PI_PROPERTIES } from 'src/modules/pi';
import { useSettings } from 'src/modules/settings';
import { APIAxiosError } from 'src/services/api-client/types';
import { formatName } from 'src/modules/contact';
import PageError from '../error/PageError';
import PageNotFound from '../error/PageNotFound';
import AddressDetails from './components/AddressDetails';
import BirthdayDetails from './components/BirthdayDetails';
import ContactPageWrapper from './components/ContactPageWrapper';
import EmailDetails from './components/EmailDetails';
import IdentityDetails from './components/IdentityDetails';
import ImDetails from './components/ImDetails';
import OrgaDetails from './components/OrgaDetails';
import PhoneDetails from './components/PhoneDetails';
import PublicKeyList from './components/PublicKeyList';

function ContactPlaceholder() {
  return (
    <>
      <div className="s-contact__tags">
        <PlaceholderBlock shape="line" display="inline-block" width="small" />
        <PlaceholderBlock shape="line" display="inline-block" />
      </div>
      <div className="s-contact__main-title s-contact-main-title">
        <div className="s-contact-main-title__avatar">
          <PlaceholderBlock shape="avatar" size="large" />
        </div>
        <div className="s-contact-main-title__name">
          <PlaceholderBlock display="inline-block" width="large" />
        </div>

        <div className="s-contact-main-title__pi">
          <PlaceholderBlock shape="square" />
        </div>
      </div>
      <div className="s-contact__contact-details">
        <Title hr>
          <PlaceholderBlock shape="line" display="inline-block" width="large" />
        </Title>
        <TextList className="s-contact__details-group">
          <TextItem>
            <PlaceholderBlock
              shape="line"
              display="inline-block"
              width="xlarge"
            />
          </TextItem>
          <TextItem>
            <PlaceholderBlock
              shape="line"
              display="inline-block"
              width="xlarge"
            />
          </TextItem>
          <TextItem>
            <PlaceholderBlock
              shape="line"
              display="inline-block"
              width="xlarge"
            />
          </TextItem>
        </TextList>
      </div>
    </>
  );
}

function Contact():
  | JSX.Element
  | React.ReactElement<typeof ContactPageWrapper> {
  const { contactId } = useParams<{ contactId: string }>();
  const { data, isFetching, isError, error } = useQuery<
    AxiosResponse<IContact>,
    APIAxiosError
  >(getQueryKeys({ contactId }), () => getContact(contactId));

  const contact = data?.data;

  const settings = useSettings();

  // XXX: problem, API return status 500 instead of 404 in this case
  if (!contact && isError && error?.response?.status === 404) {
    return <PageNotFound />;
  }

  if (!contact && isError) {
    return <PageError />;
  }

  if (!contact) {
    return (
      <ContactPageWrapper contact={contact} hasActivity={isFetching}>
        <ContactPlaceholder />
      </ContactPageWrapper>
    );
  }

  const averagePI = contact.pi
    ? getAveragePI(contact.pi, PI_PROPERTIES)
    : ' - ';
  const { identities = [], ims = [], addresses = [], infos } = contact;
  const restOfDetails = [
    ...identities.map((identity) => (
      <TextItem className="s-contact__detail" key={identity.social_id}>
        <IdentityDetails identity={identity} />
      </TextItem>
    )),
    ...ims.map((detail) => (
      <TextItem className="s-contact__detail" key={detail.im_id}>
        <ImDetails im={detail} />
      </TextItem>
    )),

    ...addresses.map((detail) => (
      <TextItem className="s-contact__detail" key={detail.address_id}>
        <AddressDetails address={detail} />
      </TextItem>
    )),
  ];

  if (infos?.birthday) {
    restOfDetails.push(
      <TextItem className="s-contact__detail" key={infos.birthday}>
        <BirthdayDetails birthday={infos.birthday} />
      </TextItem>
    );
  }

  return (
    <ContactPageWrapper contact={contact} hasActivity={isFetching}>
      <div className="s-contact__main-title s-contact-main-title">
        <div className="s-contact-main-title__avatar">
          <ContactAvatarLetter
            contact={contact}
            contactDisplayFormat={settings.contact_display_format}
            size="large"
          />
        </div>
        <div className="s-contact-main-title__name">
          {formatName({
            contact,
            format: settings.contact_display_format,
          })}
        </div>

        <div className="s-contact-main-title__pi">{averagePI}</div>

        {contact.organizations && contact.organizations.length > 0 && (
          <TextBlock className="s-contact-main-title__organizations">
            <Icon type="building" rightSpaced />
            <Trans id="contact.organizations" message="Organizations:" />{' '}
            {contact.organizations.map((orga) => (
              <OrgaDetails key={orga.organization_id} organization={orga} />
            ))}
          </TextBlock>
        )}
        {/* <ContactStats className="stats" /> */}
      </div>
      <div className="s-contact__contact-details">
        <Title hr>
          <Trans id="contact.contact-details.title" message="Contact details" />
        </Title>
        <TextList className="s-contact__details-group">
          {contact.emails?.map((email) => (
            <TextItem className="s-contact__detail" key={email.email_id}>
              <EmailDetails email={email} />
            </TextItem>
          ))}
        </TextList>
        <TextList className="s-contact__details-group">
          {contact.phones?.map((phone) => (
            <TextItem className="s-contact__detail" key={phone.phone_id}>
              <PhoneDetails phone={phone} />
            </TextItem>
          ))}
        </TextList>
        <TextList className="s-contact__details-group">
          {restOfDetails}
        </TextList>
      </div>
      <div className="s-contact__keys">
        <Title hr>
          <Trans id="contact.keys.title" message="Public keys" />
        </Title>
        <PublicKeyList contactId={contactId} />
      </div>
    </ContactPageWrapper>
  );
}

export default Contact;
