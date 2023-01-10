import * as React from 'react';
import { useLingui } from '@lingui/react';
import { formatName } from 'src/modules/contact';
import { Contact } from 'src/modules/contact/types';
import { useSettings } from 'src/modules/settings';
import {
  getTagLabel,
  getCleanedTagCollection,
  useTags,
} from '../../../../modules/tags';
import { ContactAvatarLetter, SIZE_SMALL } from '../../../../modules/avatar';
import { Badge, Link, TextBlock } from '../../../../components';
import Highlights from '../Highlights';
import './style.scss';

const CONTACT_NAME_PROPERTIES = [
  'title',
  'name_prefix, name_suffix',
  'family_name',
  'given_name',
];

const EMPTY_ARRAY = [];

interface Props {
  term: string;
  highlights?: Record<string, any>;
  contact: Contact;
}

function ContactResultItem({ contact, term, highlights }: Props) {
  const { i18n } = useLingui();
  const { contact_display_format: contactDisplayFormat } = useSettings();
  const { tags } = useTags();
  const contactTags = contact.tags
    ? getCleanedTagCollection(tags, contact.tags)
    : EMPTY_ARRAY;

  const highlight = !highlights
    ? ''
    : Object.keys(highlights)
        .filter(
          (contactProperty) =>
            CONTACT_NAME_PROPERTIES.indexOf(contactProperty) === -1
        )
        .map((contactProperty) => highlights[contactProperty])
        .join(' ... ');

  return (
    <Link
      noDecoration
      className="m-contact-result-item"
      to={`/contacts/${contact.contact_id}`}
    >
      <div className="m-contact-result-item__contact-avatar">
        <ContactAvatarLetter contact={contact} size={SIZE_SMALL} />
      </div>
      <TextBlock className="m-contact-result-item__col-title">
        {contact.name_prefix && (
          <span className="m-contact-result-item__contact-prefix">
            <Highlights term={term} highlights={contact.name_prefix} />
          </span>
        )}
        <span className="m-contact-result-item__contact-title">
          <Highlights
            term={term}
            highlights={formatName({ contact, format: contactDisplayFormat })}
          />
        </span>
        {contact.name_suffix && (
          <span className="m-contact-result-item__contact-suffix">
            , <Highlights term={term} highlights={contact.name_suffix} />
          </span>
        )}
      </TextBlock>
      <TextBlock className="m-contact-result-item__col-highlights">
        <Highlights term={term} highlights={highlight} />
      </TextBlock>
      <TextBlock className="m-contact-result-item__col-tags">
        {contactTags.map((tag) => (
          <span key={tag.name}>
            {' '}
            <Badge className="m-contact-result-item__tag">
              {getTagLabel(i18n, tag)}
            </Badge>
          </span>
        ))}
      </TextBlock>
    </Link>
  );
}

export default ContactResultItem;
