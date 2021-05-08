import * as React from 'react';
import classnames from 'classnames';
import { Trans, withI18n, withI18nProps } from '@lingui/react';
import { ContactAvatarLetter, SIZE_MEDIUM } from 'src/modules/avatar';
import { getCleanedTagCollection, getTagLabel } from 'src/modules/tags';
import { useGetTagsQuery } from 'src/modules/tags/store';
import { Button, Link, TextBlock, Icon, Checkbox, Badge } from 'src/components';
import { formatName } from 'src/services/contact';
import { ContactPayload } from 'src/modules/contact/types';
import { useSettings } from 'src/modules/settings';
import './style.scss';

const TYPE_FACEBOOK = 'facebook';
const TYPE_TWITTER = 'twitter';
const TYPE_MASTODON = 'mastodon';

const getAddress = ({ attrName, attr }) => {
  switch (attrName) {
    case 'emails':
      return {
        type: 'email',
        identifier: attr.address,
      };

    case 'phones':
      return {
        type: 'phone',
        identifier: attr.number,
      };

    case 'identities':
      switch (attr.type) {
        case TYPE_FACEBOOK:
        case TYPE_TWITTER:
        case TYPE_MASTODON:
        default:
          return {
            type: attr.type,
            identifier: attr.name,
          };
      }

    case 'ims':
      return {
        type: 'comment',
        identifier: attr.address,
      };
    default:
      console.warn('Unable to render the main address for:');
      console.table(attr);

      return undefined;
  }
};

const getMainAddresses = ({ contact }) =>
  ['emails', 'phones', 'identities', 'ims'].reduce((acc, attrName) => {
    if (acc.length === 2) {
      return acc;
    }

    if (!contact[attrName]) {
      return acc;
    }

    const mainAddress = contact[attrName].reduce((attrAcc, attr) => {
      if (!attrAcc) {
        return getAddress({ attrName, attr });
      }

      if (attr.is_primary) {
        return getAddress({ attrName, attr });
      }

      return attrAcc;
    }, undefined);

    if (!mainAddress) {
      return acc;
    }

    return [...acc, mainAddress];
  }, []);

interface Props extends withI18nProps {
  contact: ContactPayload;
  className?: string;
  onSelectEntity?: (action: 'add' | 'remove', contactId: string) => void;
  onClickContact?: (contact: ContactPayload) => void;
  isContactSelected?: boolean;
  selectDisabled: boolean;
}
function ContactItem({
  contact,
  className,
  onSelectEntity,
  onClickContact,
  isContactSelected,
  selectDisabled,
  i18n,
}: Props) {
  const { data: tags = [] } = useGetTagsQuery();
  const { contact_display_format } = useSettings();

  const onCheckboxChange = (ev) => {
    const { checked } = ev.target;

    onSelectEntity &&
      onSelectEntity(checked ? 'add' : 'remove', contact.contact_id);
  };

  const handleClickContact = () => {
    onClickContact && onClickContact(contact);
  };

  const renderClickable = (clikableProps) => {
    return onClickContact ? (
      <Button noDecoration onClick={handleClickContact} {...clikableProps} />
    ) : (
      <Link
        noDecoration
        to={`/contacts/${contact.contact_id}`}
        {...clikableProps}
      />
    );
  };

  const contactTitle = formatName({ contact, format: contact_display_format });
  const mainAddresses = getMainAddresses({ contact });

  return (
    <div className={classnames('m-contact-item', className)}>
      {renderClickable({
        className: 'm-contact-item__title',
        children: (
          <>
            <div className="m-contact-item__avatar">
              <ContactAvatarLetter
                isRound
                contact={contact}
                size={SIZE_MEDIUM}
                contactDisplayFormat={contact_display_format}
              />
            </div>
            <div className="m-contact-item__contact">
              <TextBlock className="m-contact-item__name">
                {contact.name_prefix && (
                  <span className="m-contact-item__contact-prefix">
                    {contact.name_prefix}
                  </span>
                )}
                <span className="m-contact-item__contact-title">
                  {contactTitle}
                </span>
                {contact.name_suffix && (
                  <span className="m-contact-item__contact-suffix">
                    ,{contact.name_suffix}
                  </span>
                )}
              </TextBlock>
              <div className="m-contact-item__tags">
                {contact.tags &&
                  getCleanedTagCollection(tags, contact.tags).map((tag) => (
                    <Badge key={tag.name} rightSpaced>
                      {getTagLabel(i18n, tag)}
                    </Badge>
                  ))}
              </div>
            </div>
          </>
        ),
      })}
      <div className="m-contact-item__info">
        {mainAddresses.map((address) => (
          <TextBlock key={address.identifier}>
            {/* @ts-ignore */}
            <Icon type={address.type} /> {address.identifier}
          </TextBlock>
        ))}
      </div>
      <TextBlock className="m-contact-item__select">
        {!selectDisabled && (
          <Checkbox
            label={
              <Trans id="contact-book.action.select">Select the contact</Trans>
            }
            showLabelforSr
            onChange={onCheckboxChange}
            checked={isContactSelected}
          />
        )}
      </TextBlock>
    </div>
  );
}

export default withI18n()(ContactItem);
