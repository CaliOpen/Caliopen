import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { withI18n } from 'lingui-react';
import { WithTags, getTagLabel, getCleanedTagCollection } from '../../../../modules/tags';
import { MultidimensionalPi } from '../../../../modules/pi';
import { Badge } from '../../../../components';
import { ContactAvatarLetter } from '../../../../modules/avatar';
import { formatName } from '../../../../services/contact';
import './style.scss';

@withI18n()
class ContactProfile extends Component {
  static propTypes = {
    contact: PropTypes.shape({}),
    className: PropTypes.string,
    editMode: PropTypes.bool.isRequired,
    form: PropTypes.node.isRequired,
    contactDisplayFormat: PropTypes.string.isRequired,
    i18n: PropTypes.shape({}).isRequired,
  };
  static defaultProps = {
    contact: undefined,
    className: undefined,
  };

  render() {
    const {
      contact, contactDisplayFormat: format, className, editMode, form, i18n,
    } = this.props;

    return (
      <div className={classnames('m-contact-profile', className)}>
        <div className="m-contact-profile__header">
          <div className="m-contact-profile__avatar-wrapper">
            {contact && (
              <ContactAvatarLetter
                contact={contact}
                contactDisplayFormat={format}
                className="m-contact-profile__avatar"
              />
            )}
          </div>

          {!editMode && (
            <h3 className="m-contact-profile__name">
              {contact ? formatName({ contact, format }) : i18n._('contact.profile.name_not_set', { defaults: '(N/A)' })}
            </h3>
          )}
        </div>

        {editMode && form }

        {contact && contact.tags &&
          <div className="m-contact-profile__tags">
            <WithTags render={userTags =>
              contact.tags && getCleanedTagCollection(userTags, contact.tags).map(tag => (
                <Badge className="m-contact-profile__tag" key={tag.name}>{getTagLabel(i18n, tag)}</Badge>
              ))}
            />
          </div>
        }

        {contact && contact.pi && !editMode && (

        // FIXME: on mobile, MultidimensionalPi should be displayed on
        // 2 columns (graph on left, rates on right)

          <MultidimensionalPi className="m-contact-profile__pi" pi={contact.pi} />
        )}
      </div>
    );
  }
}

export default ContactProfile;
