import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Trans } from '@lingui/react';
import { formatName } from '../../../../services/contact';
import { RawButton } from '../../../../components';
import './style.scss';

class ContactTitleField extends PureComponent {
  static propTypes = {
    contact: PropTypes.shape({}).isRequired,
    contactDisplayFormat: PropTypes.string.isRequired,
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired,
  };

  static defaultProps = {
    className: undefined,
  };

  render() {
    const {
      contact, contactDisplayFormat: format, className, onClick,
    } = this.props;

    return (
      <RawButton
        className={classnames(className, 's-contact-title-field')}
        onClick={onClick}
      >
        {
        contact ?
          formatName({ contact, format })
          :
          (<Trans id="contact.title-field.new-contact">New contact</Trans>)
        }
      </RawButton>
    );
  }
}

export default ContactTitleField;
