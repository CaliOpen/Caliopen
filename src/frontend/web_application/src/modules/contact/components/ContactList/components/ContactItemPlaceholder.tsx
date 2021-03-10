import * as React from 'react';
import classnames from 'classnames';
import { PlaceholderBlock } from 'src/components';

interface Props {
  className?: string;
}
export default function ContactItemPlaceholder({ className }: Props) {
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
