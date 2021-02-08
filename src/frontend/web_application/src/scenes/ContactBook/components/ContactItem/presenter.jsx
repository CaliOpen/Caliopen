import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Trans, withI18n } from '@lingui/react';
import { ContactAvatarLetter, SIZE_MEDIUM } from '../../../../modules/avatar';
import { getCleanedTagCollection, getTagLabel } from '../../../../modules/tags';
import {
  Button,
  Link,
  TextBlock,
  Icon,
  Checkbox,
  Badge,
  PlaceholderBlock,
} from '../../../../components';
import { formatName } from '../../../../services/contact';
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

@withI18n()
class ContactItem extends PureComponent {
  static propTypes = {
    contact: PropTypes.shape({}),
    contactDisplayFormat: PropTypes.string.isRequired,
    className: PropTypes.string,
    onSelectEntity: PropTypes.func,
    onClickContact: PropTypes.func,
    isContactSelected: PropTypes.bool,
    selectDisabled: PropTypes.bool,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
    tags: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  };

  static defaultProps = {
    contact: undefined,
    className: undefined,
    onSelectEntity: () => {
      // noop
    },
    onClickContact: undefined,
    isContactSelected: false,
    selectDisabled: false,
  };

  onCheckboxChange = (ev) => {
    const { contact, onSelectEntity } = this.props;
    const { checked } = ev.target;

    onSelectEntity(checked ? 'add' : 'remove', contact.contact_id);
  };

  handleClickContact = () => {
    const { contact, onClickContact } = this.props;

    onClickContact({ contact });
  };

  renderPlaceholder() {
    const { className } = this.props;

    return (
      <div className={classnames('m-contact-item', className)}>
        <div className="m-contact-item__title">
          <div className="m-contact-item__avatar">
            <PlaceholderBlock shape="avatar" />
          </div>
          <div className="m-contact-item__contact">
            <div className="m-contact-item__name">
              <PlaceholderBlock shape="line" />
            </div>
            <div className="m-contact-item__tags" />
          </div>
        </div>
        <div className="m-contact-item__info">
          <PlaceholderBlock />
        </div>
        <div className="m-contact-item__select">&nbsp;</div>
      </div>
    );
  }

  renderTags() {
    const { tags, contact, i18n } = this.props;

    return (
      contact.tags &&
      getCleanedTagCollection(tags, contact.tags).map((tag) => (
        <Badge key={tag.name} rightSpaced>
          {getTagLabel(i18n, tag)}
        </Badge>
      ))
    );
  }

  renderClickable(props) {
    const { contact, onClickContact } = this.props;

    return onClickContact ? (
      <Button noDecoration onClick={this.handleClickContact} {...props} />
    ) : (
      <Link noDecoration to={`/contacts/${contact.contact_id}`} {...props} />
    );
  }

  render() {
    const {
      contact,
      contactDisplayFormat: format,
      className,
      isContactSelected,
      selectDisabled,
    } = this.props;

    if (!contact) {
      return this.renderPlaceholder();
    }

    const contactTitle = formatName({ contact, format });
    const mainAddresses = getMainAddresses({ contact });

    return (
      <div className={classnames('m-contact-item', className)}>
        {this.renderClickable({
          className: 'm-contact-item__title',
          children: (
            <Fragment>
              <div className="m-contact-item__avatar">
                <ContactAvatarLetter
                  isRound
                  contact={contact}
                  size={SIZE_MEDIUM}
                  contactDisplayFormat={format}
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
                <div className="m-contact-item__tags">{this.renderTags()}</div>
              </div>
            </Fragment>
          ),
        })}
        <div className="m-contact-item__info">
          {mainAddresses.map((address) => (
            <TextBlock key={address.identifier}>
              <Icon type={address.type} /> {address.identifier}
            </TextBlock>
          ))}
        </div>
        <TextBlock className="m-contact-item__select">
          {!selectDisabled && (
            <Checkbox
              label={
                <Trans id="contact-book.action.select">
                  Select the contact
                </Trans>
              }
              showLabelforSr
              onChange={this.onCheckboxChange}
              checked={isContactSelected}
            />
          )}
        </TextBlock>
      </div>
    );
  }
}

export default ContactItem;
