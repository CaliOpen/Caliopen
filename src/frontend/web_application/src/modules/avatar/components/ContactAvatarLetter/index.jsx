import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { formatName } from 'src/modules/contact/services/format';
import AvatarLetterWrapper from '../AvatarLetterWrapper';
import AvatarLetter from '../AvatarLetter';

class ContactAvatarLetter extends PureComponent {
  static propTypes = {
    contact: PropTypes.shape({}).isRequired,
    contactDisplayFormat: PropTypes.string,
  };

  static defaultProps = {
    contactDisplayFormat: 'title',
  };

  render() {
    const { contact, contactDisplayFormat: format, ...props } = this.props;

    return (
      <AvatarLetterWrapper {...props}>
        <AvatarLetter word={formatName({ contact, format })} />
      </AvatarLetterWrapper>
    );
  }
}

export default ContactAvatarLetter;
