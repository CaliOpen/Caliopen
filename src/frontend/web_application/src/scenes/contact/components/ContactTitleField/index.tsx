import classnames from 'classnames';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { RawButton } from 'src/components';
import { ContactPayload } from 'src/modules/contact/types';
import { settingsSelector } from 'src/modules/settings';
import { formatName } from 'src/modules/contact';
import { RootState } from 'src/store/reducer';
import './style.scss';

interface Props {
  contact: ContactPayload;
  onClick: () => void;
  className: string;
}
function ContactTitleField({
  contact,
  onClick,
  className,
}: Props): React.ReactElement<typeof RawButton> {
  const {
    settings: { contact_display_format: format },
  } = useSelector<RootState, RootState['settings']>(settingsSelector);

  return (
    <RawButton
      className={classnames(className, 's-contact-title-field')}
      onClick={onClick}
    >
      {formatName({ contact, format })}
    </RawButton>
  );
}

export default ContactTitleField;
