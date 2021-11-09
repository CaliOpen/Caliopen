import * as React from 'react';
import { Icon } from 'src/components';

interface Props {
  birthday: string;
}
function BirthdayDetails({ birthday }: Props): JSX.Element {
  return (
    <span className="m-birthday-details">
      {birthday && <Icon rightSpaced type="birthday-cake" />}
      {birthday}
    </span>
  );
}

export default BirthdayDetails;
