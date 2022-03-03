import { Trans } from '@lingui/react';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  ActionBar,
  Icon,
  PageTitle,
  PlaceholderBlock,
  TextBlock,
  TextItem,
  TextList,
  Title,
} from 'src/components';
import { ContactAvatarLetter } from 'src/modules/avatar';
import { contactSelector } from 'src/modules/contact';
import { requestContact } from 'src/modules/contact/store';
import { Contact } from 'src/modules/contact/types';
import { getAveragePI } from 'src/modules/pi';
import { useSettings } from 'src/modules/settings';
import { formatName } from 'src/services/contact';
import { RootState } from 'src/store/reducer';
import AddressDetails from './components/AddressDetails';
import BirthdayDetails from './components/BirthdayDetails';
import ContactPageWrapper from './components/ContactPageWrapper';
import EmailDetails from './components/EmailDetails';
import IdentityDetails from './components/IdentityDetails';
import ImDetails from './components/ImDetails';
import OrgaDetails from './components/OrgaDetails';
import PhoneDetails from './components/PhoneDetails';
import PublicKeyList from './components/PublicKeyList';

function Contact():
  | JSX.Element
  | React.ReactElement<typeof ContactPageWrapper> {
  const dispatch = useDispatch();
  const { contactId } = useParams<{ contactId: string }>();

  React.useEffect(() => {
    dispatch(requestContact(contactId));
  }, [contactId]);

  const contact = useSelector<RootState, undefined | Contact>((state) =>
    contactSelector(state, contactId)
  );

  const settings = useSettings();

  if (!contact) {
    return (
      <div className="s-contact">
        <PageTitle />
        <ActionBar
          className="s-contact-action-bar"
          isLoading
          actionsNode={
            <>
              <PlaceholderBlock
                shape="line"
                display="inline-block"
                width="small"
              />
              :
              <PlaceholderBlock shape="line" display="inline-block" />
              <PlaceholderBlock
                shape="line"
                display="inline-block"
                width="large"
              />
            </>
          }
        />
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
            <PlaceholderBlock
              shape="line"
              display="inline-block"
              width="large"
            />
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
      </div>
    );
  }

  const averagePI = contact.pi ? getAveragePI(contact.pi) : ' - ';
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
    <ContactPageWrapper contact={contact}>
      <div className="s-contact__main-title s-contact-main-title">
        <>
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
              <Trans id="contact.organizations">Organizations:</Trans>{' '}
              {contact.organizations.map((orga) => (
                <OrgaDetails key={orga.organization_id} organization={orga} />
              ))}
            </TextBlock>
          )}
          {/* <ContactStats className="stats" /> */}
        </>
      </div>
      <div className="s-contact__contact-details">
        <>
          <Title hr>
            <Trans id="contact.contact-details.title">Contact details</Trans>
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
        </>
      </div>
      <div className="s-contact__keys">
        <>
          <Title hr>
            <Trans id="contact.keys.title">Public keys</Trans>
          </Title>
          <PublicKeyList contactId={contactId} />
        </>
      </div>
    </ContactPageWrapper>
  );
}

export default Contact;
