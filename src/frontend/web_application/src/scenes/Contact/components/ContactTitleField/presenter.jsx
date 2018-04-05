import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import TextFieldGroup from '../../../../components/TextFieldGroup';
import { formatName } from '../../../../services/contact';


class ContactTitleField extends PureComponent {
  static propTypes = {
    i18n: PropTypes.shape({}).isRequired,
    contact: PropTypes.shape({}).isRequired,
    contactDisplayFormat: PropTypes.string.isRequired,
    className: PropTypes.string,
  };
  static defaultProps = {
    className: undefined,
  };

  render() {
    const {
      i18n, contact, contactDisplayFormat: format, className,
    } = this.props;

    return (
      <TextFieldGroup
        className={className}
        label={i18n._('contact_profile.form.title.label', { defaults: 'Title' })}
        placeholder={i18n._('contact_profile.form.title.label', { defaults: 'Title' })}
        defaultValue={formatName({ contact, format })}
        disabled
        showLabelforSr
      />
    );
  }
}

export default ContactTitleField;
